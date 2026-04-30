#property strict
#property version   "1.20"
#property description "Unified Local Trade Copier Master single-file source"

#define LTC_WIDTH                 400
#define LTC_MASTER_HEIGHT         515
#define LTC_RECEIVER_HEIGHT       680
#define LTC_BLUE                  C'57,183,236'
#define LTC_ORANGE                C'255,102,0'
#define LTC_BORDER                clrSilver
#define LTC_PANEL_BG              clrWhiteSmoke
#define LTC_TEXT                  clrBlack
#define LTC_BRIDGE_FOLDER         "LocalTradeCopierBridge"
#define LTC_HEARTBEAT_SECONDS     6

#define LTC_TYPE_BUY              0
#define LTC_TYPE_SELL             1
#define LTC_TYPE_BUYLIMIT         2
#define LTC_TYPE_SELLLIMIT        3
#define LTC_TYPE_BUYSTOP          4
#define LTC_TYPE_SELLSTOP         5
#define LTC_TYPE_BUYSTOPLIMIT     6
#define LTC_TYPE_SELLSTOPLIMIT    7

struct LTCTradeRow
{
   long   master_ticket;
   string symbol;
   int    order_type;
   double volume;
   double price;
   double sl;
   double tp;
   string comment;
   long   magic;
};

struct LTCMapRow
{
   long   master_ticket;
   long   local_ticket;
   int    order_type;
};

string LTCSafeChannelName(string value)
{
   StringTrimLeft(value);
   StringTrimRight(value);
   StringReplace(value,"\\","_");
   StringReplace(value,"/","_");
   StringReplace(value,":","_");
   StringReplace(value,"*","_");
   StringReplace(value,"?","_");
   StringReplace(value,"\"","_");
   StringReplace(value,"<","_");
   StringReplace(value,">","_");
   StringReplace(value,"|","_");
   StringReplace(value," ","_");
   return value;
}

string LTCMasterStateFile(const string channel)
{
   return LTC_BRIDGE_FOLDER + "\\" + LTCSafeChannelName(channel) + "_master_state.csv";
}

string LTCMasterTradesFile(const string channel)
{
   return LTC_BRIDGE_FOLDER + "\\" + LTCSafeChannelName(channel) + "_master_trades.csv";
}

string LTCReceiverStateFile(const string channel,const long login_id)
{
   return LTC_BRIDGE_FOLDER + "\\" + LTCSafeChannelName(channel) + "_receiver_" + IntegerToString((int)login_id) + ".csv";
}

string LTCMapFile(const string channel,const long login_id)
{
   return LTC_BRIDGE_FOLDER + "\\" + LTCSafeChannelName(channel) + "_map_" + IntegerToString((int)login_id) + ".csv";
}

bool LTCEnsureBridgeFolder()
{
   ResetLastError();
   FolderCreate(LTC_BRIDGE_FOLDER,FILE_COMMON);
   return true;
}

int LTCParseMinutes(const string hhmm)
{
   string parts[];
   if(StringSplit(hhmm,':',parts) != 2)
      return -1;

   int hh = (int)StringToInteger(parts[0]);
   int mm = (int)StringToInteger(parts[1]);
   if(hh < 0 || hh > 23 || mm < 0 || mm > 59)
      return -1;
   return hh * 60 + mm;
}

bool LTCIsBlockedByTime(const string from_value,const string to_value)
{
   int from_minutes = LTCParseMinutes(from_value);
   int to_minutes   = LTCParseMinutes(to_value);
   if(from_minutes < 0 || to_minutes < 0)
      return false;

   MqlDateTime now_struct;
   TimeToStruct(TimeCurrent(),now_struct);
   int now_minutes = now_struct.hour * 60 + now_struct.min;

   if(from_minutes == to_minutes)
      return false;

   if(from_minutes < to_minutes)
      return (now_minutes >= from_minutes && now_minutes <= to_minutes);

   return (now_minutes >= from_minutes || now_minutes <= to_minutes);
}

string LTCBoolText(const bool flag)
{
   return flag ? "1" : "0";
}

bool LTCTextToBool(const string value)
{
   return (value == "1" || value == "true" || value == "TRUE");
}

int LTCFindMapIndex(LTCMapRow &rows[],const long master_ticket)
{
   for(int i=0;i<ArraySize(rows);i++)
   {
      if(rows[i].master_ticket == master_ticket)
         return i;
   }
   return -1;
}

bool LTCSaveMapRows(const string file_name,LTCMapRow &rows[])
{
   LTCEnsureBridgeFolder();
   int handle = FileOpen(file_name,FILE_WRITE|FILE_CSV|FILE_COMMON|FILE_ANSI,';');
   if(handle == INVALID_HANDLE)
      return false;

   for(int i=0;i<ArraySize(rows);i++)
      FileWrite(handle,(string)rows[i].master_ticket,(string)rows[i].local_ticket,(string)rows[i].order_type);

   FileClose(handle);
   return true;
}

bool LTCLoadMapRows(const string file_name,LTCMapRow &rows[])
{
   ArrayResize(rows,0);
   int handle = FileOpen(file_name,FILE_READ|FILE_CSV|FILE_COMMON|FILE_ANSI,';');
   if(handle == INVALID_HANDLE)
      return false;

   while(!FileIsEnding(handle))
   {
      string a = FileReadString(handle);
      if(a == "" && FileIsEnding(handle))
         break;

      string b = FileReadString(handle);
      string c = FileReadString(handle);
      int pos = ArraySize(rows);
      ArrayResize(rows,pos+1);
      rows[pos].master_ticket = (long)StringToInteger(a);
      rows[pos].local_ticket  = (long)StringToInteger(b);
      rows[pos].order_type    = (int)StringToInteger(c);
   }

   FileClose(handle);
   return true;
}

bool LTCLoadTradeRows(const string file_name,LTCTradeRow &rows[])
{
   ArrayResize(rows,0);
   int handle = FileOpen(file_name,FILE_READ|FILE_CSV|FILE_COMMON|FILE_ANSI,';');
   if(handle == INVALID_HANDLE)
      return false;

   while(!FileIsEnding(handle))
   {
      string a = FileReadString(handle);
      if(a == "" && FileIsEnding(handle))
         break;

      string b = FileReadString(handle);
      string c = FileReadString(handle);
      string d = FileReadString(handle);
      string e = FileReadString(handle);
      string f = FileReadString(handle);
      string g = FileReadString(handle);
      string h = FileReadString(handle);
      string i = FileReadString(handle);

      int pos = ArraySize(rows);
      ArrayResize(rows,pos+1);
      rows[pos].master_ticket = (long)StringToInteger(a);
      rows[pos].symbol        = b;
      rows[pos].order_type    = (int)StringToInteger(c);
      rows[pos].volume        = StringToDouble(d);
      rows[pos].price         = StringToDouble(e);
      rows[pos].sl            = StringToDouble(f);
      rows[pos].tp            = StringToDouble(g);
      rows[pos].comment       = h;
      rows[pos].magic         = (long)StringToInteger(i);
   }

   FileClose(handle);
   return true;
}

bool LTCWriteKeyValue(const string file_name,string keys[],string values[])
{
   LTCEnsureBridgeFolder();
   int handle = FileOpen(file_name,FILE_WRITE|FILE_CSV|FILE_COMMON|FILE_ANSI,';');
   if(handle == INVALID_HANDLE)
      return false;

   int size = MathMin(ArraySize(keys),ArraySize(values));
   for(int i=0;i<size;i++)
      FileWrite(handle,keys[i],values[i]);

   FileClose(handle);
   return true;
}

string LTCReadValue(const string file_name,const string wanted_key)
{
   int handle = FileOpen(file_name,FILE_READ|FILE_CSV|FILE_COMMON|FILE_ANSI,';');
   if(handle == INVALID_HANDLE)
      return "";

   string result = "";
   while(!FileIsEnding(handle))
   {
      string key = FileReadString(handle);
      if(key == "" && FileIsEnding(handle))
         break;
      string value = FileReadString(handle);
      if(key == wanted_key)
      {
         result = value;
         break;
      }
   }
   FileClose(handle);
   return result;
}

bool LTCReceiverHeartbeatAlive(const string channel)
{
   string mask = LTC_BRIDGE_FOLDER + "\\" + LTCSafeChannelName(channel) + "_receiver_*.csv";
   string file_name;
   long handle = FileFindFirst(mask,file_name,FILE_COMMON);
   if(handle == INVALID_HANDLE)
      return false;

   bool found_live = false;
   do
   {
      string path = LTC_BRIDGE_FOLDER + "\\" + file_name;
      string status = LTCReadValue(path,"status");
      string updated = LTCReadValue(path,"updated_ts");
      if(status == "ACTIVE")
      {
         datetime stamp = (datetime)StringToInteger(updated);
         if((TimeCurrent() - stamp) <= LTC_HEARTBEAT_SECONDS)
         {
            found_live = true;
            break;
         }
      }
   }
   while(FileFindNext(handle,file_name));

   FileFindClose(handle);
   return found_live;
}

#include <Controls\Dialog.mqh>
#include <Controls\Button.mqh>
#include <Controls\Edit.mqh>
#include <Controls\CheckBox.mqh>
#include <Controls\Label.mqh>
#include <Controls\ComboBox.mqh>
#include <Controls\Panel.mqh>

#ifdef __MQL5__

class MasterWindow : public CAppDialog
{
private:
   CPanel    active_box, settings_box;
   CPanel    top_bar, popup_menu, popup_settings;
   CButton   btn_toggle;
   CButton   btn_menu, btn_pin, btn_close, menu_settings_btn, menu_accounts_btn, menu_reset_btn, menu_update_btn, menu_about_btn, settings_ok_btn;
   CLabel    title_text, status_title, status_text, icon_text, popup_title;
   CLabel    lbl_channel, lbl_order, lbl_sl, lbl_wc, lbl_woc, lbl_wm, lbl_wom, lbl_time, lbl_period, lbl_from, lbl_to, lbl_symbol, lbl_inv, lbl_inv_note, lbl_pushed;
   CCheckBox chk_auto_update, chk_debug_mode, chk_email, chk_mobile, chk_telegram;
   CEdit     edt_channel, edt_from, edt_to;
   CCheckBox chk_buy, chk_sell, chk_pending, chk_sl, chk_tp, chk_w_comment, chk_wo_comment, chk_w_magic, chk_wo_magic, chk_symbol, chk_invert;
   CComboBox cmb_time, cmb_pushed;
   bool      running;
   bool      menu_visible;
   bool      settings_visible;

public:
            MasterWindow() { running=false; menu_visible=false; settings_visible=false; }
   bool     Create(const long chart,const string name,const int subwin,const int x1,const int y1,const int x2,const int y2);
   bool     OnEvent(const int id,const long &lparam,const double &dparam,const string &sparam);
   void     RefreshState();
   bool     IsRunning() const { return running; }
   string   Channel() { return edt_channel.Text(); }
   bool     AllowBuy() { return chk_buy.Checked(); }
   bool     AllowSell() { return chk_sell.Checked(); }
   bool     AllowPending() { return chk_pending.Checked(); }
   bool     CopySL() { return chk_sl.Checked(); }
   bool     CopyTP() { return chk_tp.Checked(); }
   bool     DebugMode() { return chk_debug_mode.Checked(); }
   bool     NotifyEmail() { return chk_email.Checked(); }
   bool     NotifyMobile() { return chk_mobile.Checked(); }
   bool     NotifyTelegram() { return chk_telegram.Checked(); }
   bool     AutoUpdate() { return chk_auto_update.Checked(); }
   bool     AllowByComment(const string comment);
   bool     AllowByMagic(const long magic);
   bool     TimeBlocked() { return cmb_time.Select()==0 ? false : LTCIsBlockedByTime(edt_from.Text(),edt_to.Text()); }

private:
   void     Toggle();
   void     SetRunningUi(const bool live,const string detail);
   void     ToggleMenu(const bool visible);
   void     ToggleSettings(const bool visible);
   void     ResetDefaults();
};

bool MasterWindow::Create(const long chart,const string name,const int subwin,const int x1,const int y1,const int x2,const int y2)
{
   if(!CAppDialog::Create(chart,name,subwin,x1,y1,x2,y2))
      return false;

   top_bar.Create(chart,name+"TopBar",subwin,0,0,LTC_WIDTH,28);
   top_bar.ColorBackground(LTC_BLUE);
   Add(top_bar);

   title_text.Create(chart,name+"TopTitle",subwin,110,4,300,24);
   title_text.Text("Local Trade Copier");
   title_text.Color(clrWhite);
   Add(title_text);

   btn_menu.Create(chart,name+"MenuBtn",subwin,334,4,350,20);
   btn_menu.Text("=");
   btn_menu.ColorBackground(C'94,94,94');
   Add(btn_menu);

   btn_pin.Create(chart,name+"PinBtn",subwin,354,4,370,20);
   btn_pin.Text("_");
   btn_pin.ColorBackground(C'120,120,120');
   Add(btn_pin);

   btn_close.Create(chart,name+"CloseBtn",subwin,374,4,392,20);
   btn_close.Text("x");
   btn_close.ColorBackground(C'180,180,180');
   Add(btn_close);

   active_box.Create(chart,name+"A",subwin,8,40,LTC_WIDTH-8,125);
   Add(active_box);
   settings_box.Create(chart,name+"S",subwin,8,135,LTC_WIDTH-8,LTC_MASTER_HEIGHT-10);
   Add(settings_box);

   status_title.Create(chart,name+"t1",subwin,138,32,270,52);
   status_title.Text("ACTIVE STATUS");
   Add(status_title);

   btn_toggle.Create(chart,name+"btn",subwin,150,60,245,88);
   btn_toggle.Text("ON");
   btn_toggle.ColorBackground(LTC_BLUE);
   Add(btn_toggle);

   icon_text.Create(chart,name+"icon",subwin,255,60,315,90);
   icon_text.Text("[o] )))");
   Add(icon_text);

   status_text.Create(chart,name+"txt",subwin,120,98,300,118);
   status_text.Text("Copier is stopped");
   Add(status_text);

   lbl_channel.Create(chart,name+"lc",subwin,58,158,145,178); lbl_channel.Text("Channel name :"); Add(lbl_channel);
   edt_channel.Create(chart,name+"ec",subwin,160,156,350,178); edt_channel.Text("ayush"); Add(edt_channel);

   lbl_order.Create(chart,name+"lo",subwin,78,183,145,203); lbl_order.Text("Order filter :"); Add(lbl_order);
   chk_buy.Create(chart,name+"cb1",subwin,160,183,210,203); chk_buy.Text("Buy"); chk_buy.Checked(true); Add(chk_buy);
   chk_sell.Create(chart,name+"cb2",subwin,215,183,270,203); chk_sell.Text("Sell"); chk_sell.Checked(true); Add(chk_sell);
   chk_pending.Create(chart,name+"cb3",subwin,275,183,350,203); chk_pending.Text("Pending"); chk_pending.Checked(true); Add(chk_pending);

   lbl_sl.Create(chart,name+"lsl",subwin,73,208,145,228); lbl_sl.Text("Copy SL & TP :"); Add(lbl_sl);
   chk_sl.Create(chart,name+"csl",subwin,160,208,210,228); chk_sl.Text("SL"); chk_sl.Checked(true); Add(chk_sl);
   chk_tp.Create(chart,name+"ctp",subwin,215,208,265,228); chk_tp.Text("TP"); chk_tp.Checked(true); Add(chk_tp);

   lbl_wc.Create(chart,name+"lwc",subwin,57,233,145,253); lbl_wc.Text("With comment :"); Add(lbl_wc);
   chk_w_comment.Create(chart,name+"wcc",subwin,160,233,180,253); chk_w_comment.Checked(false); Add(chk_w_comment);

   lbl_woc.Create(chart,name+"lwoc",subwin,45,258,145,278); lbl_woc.Text("Without comment :"); Add(lbl_woc);
   chk_wo_comment.Create(chart,name+"wocc",subwin,160,258,180,278); chk_wo_comment.Checked(false); Add(chk_wo_comment);

   lbl_wm.Create(chart,name+"lwm",subwin,62,283,145,303); lbl_wm.Text("With magic # :"); Add(lbl_wm);
   chk_w_magic.Create(chart,name+"wmc",subwin,160,283,180,303); chk_w_magic.Checked(false); Add(chk_w_magic);

   lbl_wom.Create(chart,name+"lwom",subwin,50,308,145,328); lbl_wom.Text("Without magic # :"); Add(lbl_wom);
   chk_wo_magic.Create(chart,name+"womc",subwin,160,308,180,328); chk_wo_magic.Checked(false); Add(chk_wo_magic);

   lbl_time.Create(chart,name+"ltf",subwin,76,338,145,358); lbl_time.Text("Time Filter :"); Add(lbl_time);
   cmb_time.Create(chart,name+"ctf",subwin,160,336,350,358); cmb_time.ItemAdd("Disabled"); cmb_time.ItemAdd("Not copy in time period"); cmb_time.Select(1); Add(cmb_time);

   lbl_period.Create(chart,name+"lp",subwin,37,368,155,388); lbl_period.Text("Time Filter Period :"); Add(lbl_period);
   lbl_from.Create(chart,name+"lf",subwin,165,368,200,388); lbl_from.Text("From"); Add(lbl_from);
   edt_from.Create(chart,name+"ef",subwin,200,366,250,388); edt_from.Text("hh:mm"); Add(edt_from);
   lbl_to.Create(chart,name+"lt",subwin,263,368,285,388); lbl_to.Text("To"); Add(lbl_to);
   edt_to.Create(chart,name+"et",subwin,285,366,335,388); edt_to.Text("hh:mm"); Add(edt_to);

   lbl_symbol.Create(chart,name+"ls",subwin,72,397,145,417); lbl_symbol.Text("Symbol filter :"); Add(lbl_symbol);
   chk_symbol.Create(chart,name+"sf",subwin,160,397,180,417); chk_symbol.Checked(false); Add(chk_symbol);

   lbl_inv.Create(chart,name+"li",subwin,70,427,145,447); lbl_inv.Text("Inverted copy :"); Add(lbl_inv);
   chk_invert.Create(chart,name+"ic",subwin,160,427,180,447); chk_invert.Checked(false); Add(chk_invert);
   lbl_inv_note.Create(chart,name+"lin",subwin,185,427,360,447); lbl_inv_note.Text("(Buy <-> Sell, SL <-> TP)"); Add(lbl_inv_note);

   lbl_pushed.Create(chart,name+"lp2",subwin,54,457,145,477); lbl_pushed.Text("Pushed comment :"); Add(lbl_pushed);
   cmb_pushed.Create(chart,name+"pc",subwin,160,455,350,477); cmb_pushed.ItemAdd("None"); cmb_pushed.ItemAdd("Master"); cmb_pushed.Select(0); Add(cmb_pushed);

   popup_menu.Create(chart,name+"PopupMenu",subwin,185,28,392,150);
   popup_menu.ColorBackground(clrWhite);
   popup_menu.ColorBorder(clrBlack);
   Add(popup_menu);

   menu_settings_btn.Create(chart,name+"MenuSettings",subwin,185,32,392,50);
   menu_settings_btn.Text("Settings...");
   menu_settings_btn.ColorBackground(clrWhite);
   Add(menu_settings_btn);

   menu_accounts_btn.Create(chart,name+"MenuAccounts",subwin,185,54,392,72);
   menu_accounts_btn.Text("Using accounts list");
   menu_accounts_btn.ColorBackground(clrWhite);
   Add(menu_accounts_btn);

   menu_reset_btn.Create(chart,name+"MenuReset",subwin,185,76,392,94);
   menu_reset_btn.Text("Reset to default settings");
   menu_reset_btn.ColorBackground(clrWhite);
   Add(menu_reset_btn);

   menu_update_btn.Create(chart,name+"MenuUpdate",subwin,185,98,392,116);
   menu_update_btn.Text("Check for update...");
   menu_update_btn.ColorBackground(clrWhite);
   Add(menu_update_btn);

   menu_about_btn.Create(chart,name+"MenuAbout",subwin,185,120,392,138);
   menu_about_btn.Text("About...");
   menu_about_btn.ColorBackground(clrWhite);
   Add(menu_about_btn);

   popup_settings.Create(chart,name+"PopupSettings",subwin,8,40,LTC_WIDTH-8,235);
   popup_settings.ColorBackground(clrWhite);
   popup_settings.ColorBorder(clrBlack);
   Add(popup_settings);

   chk_auto_update.Create(chart,name+"SetAuto",subwin,36,62,245,82);
   chk_auto_update.Text("Auto update to new version");
   chk_auto_update.Checked(true);
   Add(chk_auto_update);

   chk_debug_mode.Create(chart,name+"SetDebug",subwin,36,87,245,107);
   chk_debug_mode.Text("Debug mode (print out activity logs)");
   chk_debug_mode.Checked(true);
   Add(chk_debug_mode);

   chk_email.Create(chart,name+"SetMail",subwin,36,112,245,132);
   chk_email.Text("Send notification to email");
   chk_email.Checked(true);
   Add(chk_email);

   chk_mobile.Create(chart,name+"SetMobile",subwin,36,137,245,157);
   chk_mobile.Text("Send notification to mobile");
   chk_mobile.Checked(true);
   Add(chk_mobile);

   chk_telegram.Create(chart,name+"SetTelegram",subwin,36,162,245,182);
   chk_telegram.Text("Send notification to telegram");
   chk_telegram.Checked(false);
   Add(chk_telegram);

   settings_ok_btn.Create(chart,name+"SettingsOk",subwin,150,190,245,218);
   settings_ok_btn.Text("OK");
   settings_ok_btn.ColorBackground(LTC_BLUE);
   Add(settings_ok_btn);

   ToggleMenu(false);
   ToggleSettings(false);

   SetRunningUi(false,"Copier is stopped");
   return true;
}

bool MasterWindow::AllowByComment(const string comment)
{
   string clean_comment = comment;
   StringTrimLeft(clean_comment);
   StringTrimRight(clean_comment);
   bool has_comment = (StringLen(clean_comment) > 0);
   if(chk_w_comment.Checked() && !has_comment) return false;
   if(chk_wo_comment.Checked() && has_comment) return false;
   return true;
}

bool MasterWindow::AllowByMagic(const long magic)
{
   bool has_magic = (magic != 0);
   if(chk_w_magic.Checked() && !has_magic) return false;
   if(chk_wo_magic.Checked() && has_magic) return false;
   return true;
}

void MasterWindow::SetRunningUi(const bool live,const string detail)
{
   running = live;
   btn_toggle.Text(live ? "ON" : "OFF");
   btn_toggle.ColorBackground(live ? LTC_BLUE : clrSilver);
   status_text.Text(detail);
}

void MasterWindow::ToggleMenu(const bool visible)
{
   menu_visible = visible;
   popup_menu.Show(visible);
   menu_settings_btn.Show(visible);
   menu_accounts_btn.Show(visible);
   menu_reset_btn.Show(visible);
   menu_update_btn.Show(visible);
   menu_about_btn.Show(visible);
}

void MasterWindow::ToggleSettings(const bool visible)
{
   settings_visible = visible;
   popup_settings.Show(visible);
   chk_auto_update.Show(visible);
   chk_debug_mode.Show(visible);
   chk_email.Show(visible);
   chk_mobile.Show(visible);
   chk_telegram.Show(visible);
   settings_ok_btn.Show(visible);
}

void MasterWindow::ResetDefaults()
{
   edt_channel.Text("ayush");
   chk_buy.Checked(true);
   chk_sell.Checked(true);
   chk_pending.Checked(true);
   chk_sl.Checked(true);
   chk_tp.Checked(true);
   chk_w_comment.Checked(false);
   chk_wo_comment.Checked(false);
   chk_w_magic.Checked(false);
   chk_wo_magic.Checked(false);
   cmb_time.Select(1);
   edt_from.Text("hh:mm");
   edt_to.Text("hh:mm");
   chk_symbol.Checked(false);
   chk_invert.Checked(false);
   cmb_pushed.Select(0);
   chk_auto_update.Checked(true);
   chk_debug_mode.Checked(true);
   chk_email.Checked(true);
   chk_mobile.Checked(true);
   chk_telegram.Checked(false);
}

void MasterWindow::Toggle()
{
   if(!running)
   {
      string channel = LTCSafeChannelName(edt_channel.Text());
      if(channel == "")
      {
         MessageBox("Channel name is required.","Local Trade Copier",MB_OK);
         return;
      }
      SetRunningUi(true,"Copier is running");
   }
   else
   {
      SetRunningUi(false,"Copier is stopped");
   }
}

void MasterWindow::RefreshState()
{
   if(!running)
      return;
   bool connected = LTCReceiverHeartbeatAlive(edt_channel.Text());
   status_text.Text(connected ? "Connected to receiver" : "Waiting for receiver...");
}

bool MasterWindow::OnEvent(const int id,const long &lparam,const double &dparam,const string &sparam)
{
   if(id == CHARTEVENT_OBJECT_CLICK && sparam == btn_toggle.Name())
   {
      Toggle();
      return true;
   }
   if(id == CHARTEVENT_OBJECT_CLICK && sparam == btn_menu.Name())
   {
      ToggleMenu(!menu_visible);
      return true;
   }
   if(id == CHARTEVENT_OBJECT_CLICK && sparam == btn_close.Name())
   {
      ToggleMenu(false);
      ToggleSettings(false);
      if(running)
         Toggle();
      ExpertRemove();
      return true;
   }
   if(id == CHARTEVENT_OBJECT_CLICK && sparam == menu_settings_btn.Name())
   {
      ToggleMenu(false);
      ToggleSettings(true);
      return true;
   }
   if(id == CHARTEVENT_OBJECT_CLICK && sparam == settings_ok_btn.Name())
   {
      ToggleSettings(false);
      return true;
   }
   if(id == CHARTEVENT_OBJECT_CLICK && sparam == menu_reset_btn.Name())
   {
      ResetDefaults();
      ToggleMenu(false);
      return true;
   }
   if(id == CHARTEVENT_OBJECT_CLICK && sparam == menu_accounts_btn.Name())
   {
      ToggleMenu(false);
      MessageBox("This build uses the current terminal account automatically.","Local Trade Copier",MB_OK|MB_ICONINFORMATION);
      return true;
   }
   if(id == CHARTEVENT_OBJECT_CLICK && sparam == menu_update_btn.Name())
   {
      ToggleMenu(false);
      MessageBox("Auto update settings are available in the Settings window.","Local Trade Copier",MB_OK|MB_ICONINFORMATION);
      return true;
   }
   if(id == CHARTEVENT_OBJECT_CLICK && sparam == menu_about_btn.Name())
   {
      ToggleMenu(false);
      MessageBox("Local Trade Copier Master\nScreenshot-style UI with local bridge backend.","Local Trade Copier",MB_OK|MB_ICONINFORMATION);
      return true;
   }
   return CAppDialog::OnEvent(id,lparam,dparam,sparam);
}

MasterWindow UI;

bool IsAllowedTypeMaster(const int type)
{
   if(type == LTC_TYPE_BUY) return UI.AllowBuy();
   if(type == LTC_TYPE_SELL) return UI.AllowSell();
   return UI.AllowPending();
}

void WriteMasterState()
{
   string keys[], vals[];
   ArrayResize(keys,17);
   ArrayResize(vals,17);
   keys[0]="status"; vals[0]=UI.IsRunning() ? "ONLINE" : "OFFLINE";
   keys[1]="channel"; vals[1]=LTCSafeChannelName(UI.Channel());
   keys[2]="updated_ts"; vals[2]=(string)TimeCurrent();
   keys[3]="updated"; vals[3]=TimeToString(TimeCurrent(),TIME_DATE|TIME_SECONDS);
   keys[4]="master_name"; vals[4]=AccountInfoString(ACCOUNT_NAME);
   keys[5]="login"; vals[5]=(string)AccountInfoInteger(ACCOUNT_LOGIN);
   keys[6]="platform"; vals[6]="MT5";
   keys[7]="receiver_connected"; vals[7]=LTCReceiverHeartbeatAlive(UI.Channel()) ? "1" : "0";
   keys[8]="copy_buy"; vals[8]=LTCBoolText(UI.AllowBuy());
   keys[9]="copy_sell"; vals[9]=LTCBoolText(UI.AllowSell());
   keys[10]="copy_pending"; vals[10]=LTCBoolText(UI.AllowPending());
   keys[11]="copy_sl"; vals[11]=LTCBoolText(UI.CopySL());
   keys[12]="copy_tp"; vals[12]=LTCBoolText(UI.CopyTP());
   keys[13]="auto_update"; vals[13]=LTCBoolText(UI.AutoUpdate());
   keys[14]="notify_email"; vals[14]=LTCBoolText(UI.NotifyEmail());
   keys[15]="notify_mobile"; vals[15]=LTCBoolText(UI.NotifyMobile());
   keys[16]="notify_telegram"; vals[16]=LTCBoolText(UI.NotifyTelegram());
   LTCWriteKeyValue(LTCMasterStateFile(UI.Channel()),keys,vals);
}

void WriteMasterTrades()
{
   LTCEnsureBridgeFolder();
   int handle = FileOpen(LTCMasterTradesFile(UI.Channel()),FILE_WRITE|FILE_CSV|FILE_COMMON|FILE_ANSI,';');
   if(handle == INVALID_HANDLE)
      return;

   bool block_by_time = UI.TimeBlocked();
   int exported_rows = 0;
   for(int i=0;i<PositionsTotal();i++)
   {
      ulong ticket = PositionGetTicket(i);
      if(!PositionSelectByTicket(ticket))
         continue;
      int type = (int)PositionGetInteger(POSITION_TYPE);
      string symbol = PositionGetString(POSITION_SYMBOL);
      string comment = PositionGetString(POSITION_COMMENT);
      long magic = PositionGetInteger(POSITION_MAGIC);
      if(!IsAllowedTypeMaster(type) || !UI.AllowByComment(comment) || !UI.AllowByMagic(magic) || block_by_time)
         continue;

      double sl = UI.CopySL() ? PositionGetDouble(POSITION_SL) : 0.0;
      double tp = UI.CopyTP() ? PositionGetDouble(POSITION_TP) : 0.0;
      FileWrite(handle,(string)ticket,symbol,(string)type,DoubleToString(PositionGetDouble(POSITION_VOLUME),2),
                DoubleToString(PositionGetDouble(POSITION_PRICE_OPEN),(int)SymbolInfoInteger(symbol,SYMBOL_DIGITS)),
                DoubleToString(sl,(int)SymbolInfoInteger(symbol,SYMBOL_DIGITS)),
                DoubleToString(tp,(int)SymbolInfoInteger(symbol,SYMBOL_DIGITS)),
                comment,(string)magic);
      exported_rows++;
   }

   for(int i=0;i<OrdersTotal();i++)
   {
      ulong ticket = OrderGetTicket(i);
      if(!OrderSelect(ticket))
         continue;
      ENUM_ORDER_TYPE order_type = (ENUM_ORDER_TYPE)OrderGetInteger(ORDER_TYPE);
      int type = -1;
      if(order_type == ORDER_TYPE_BUY_LIMIT) type = LTC_TYPE_BUYLIMIT;
      if(order_type == ORDER_TYPE_SELL_LIMIT) type = LTC_TYPE_SELLLIMIT;
      if(order_type == ORDER_TYPE_BUY_STOP) type = LTC_TYPE_BUYSTOP;
      if(order_type == ORDER_TYPE_SELL_STOP) type = LTC_TYPE_SELLSTOP;
      if(order_type == ORDER_TYPE_BUY_STOP_LIMIT) type = LTC_TYPE_BUYSTOPLIMIT;
      if(order_type == ORDER_TYPE_SELL_STOP_LIMIT) type = LTC_TYPE_SELLSTOPLIMIT;
      if(type < 0 || !UI.AllowPending())
         continue;
      string symbol = OrderGetString(ORDER_SYMBOL);
      string comment = OrderGetString(ORDER_COMMENT);
      long magic = OrderGetInteger(ORDER_MAGIC);
      if(!UI.AllowByComment(comment) || !UI.AllowByMagic(magic) || block_by_time)
         continue;

      FileWrite(handle,(string)ticket,symbol,(string)type,DoubleToString(OrderGetDouble(ORDER_VOLUME_INITIAL),2),
                DoubleToString(OrderGetDouble(ORDER_PRICE_OPEN),(int)SymbolInfoInteger(symbol,SYMBOL_DIGITS)),
                DoubleToString(UI.CopySL() ? OrderGetDouble(ORDER_SL) : 0.0,(int)SymbolInfoInteger(symbol,SYMBOL_DIGITS)),
                DoubleToString(UI.CopyTP() ? OrderGetDouble(ORDER_TP) : 0.0,(int)SymbolInfoInteger(symbol,SYMBOL_DIGITS)),
                comment,(string)magic);
      exported_rows++;
   }
   FileClose(handle);
   if(UI.DebugMode())
      Print("LTC master export: channel=", UI.Channel(), " rows=", exported_rows);
}

int OnInit()
{
   if(!UI.Create(0,"Local Trade Copier",0,20,20,20+LTC_WIDTH,20+LTC_MASTER_HEIGHT))
      return INIT_FAILED;
   EventSetTimer(1);
   UI.Run();
   return INIT_SUCCEEDED;
}

void OnDeinit(const int reason)
{
   EventKillTimer();
   WriteMasterState();
   UI.Destroy(reason);
}

void OnTimer()
{
   UI.RefreshState();
   WriteMasterState();
   if(UI.IsRunning())
      WriteMasterTrades();
}

void OnTick()
{
   if(UI.IsRunning())
      WriteMasterTrades();
}

void OnChartEvent(const int id,const long &lparam,const double &dparam,const string &sparam)
{
   UI.ChartEvent(id,lparam,dparam,sparam);
}

#else

class MT4MasterWindow : public CAppDialog
{
private:
   CPanel box1, box2;
   CButton btn;
   CLabel status_title, status_text;
   CEdit  edt_channel, edt_from, edt_to;
   CCheckBox chk_buy, chk_sell, chk_pending, chk_sl, chk_tp;
   CComboBox cmb_time;
   bool running;
public:
   MT4MasterWindow(){ running=false; }
   bool Create(const long chart,const string name,const int subwin,const int x1,const int y1,const int x2,const int y2);
   bool OnEvent(const int id,const long &lparam,const double &dparam,const string &sparam);
   string Channel(){ return edt_channel.Text(); }
   bool IsRunning() const { return running; }
   bool AllowBuy(){ return chk_buy.Checked(); }
   bool AllowSell(){ return chk_sell.Checked(); }
   bool AllowPending(){ return chk_pending.Checked(); }
   bool CopySL(){ return chk_sl.Checked(); }
   bool CopyTP(){ return chk_tp.Checked(); }
   bool TimeBlocked(){ return cmb_time.Select()==0 ? false : LTCIsBlockedByTime(edt_from.Text(),edt_to.Text()); }
   void SetStatus(const string text){ status_text.Text(text); }
};

bool MT4MasterWindow::Create(const long chart,const string name,const int subwin,const int x1,const int y1,const int x2,const int y2)
{
   if(!CAppDialog::Create(chart,name,subwin,x1,y1,x2,y2)) return false;
   box1.Create(chart,name+"a",subwin,8,40,LTC_WIDTH-8,125); Add(box1);
   box2.Create(chart,name+"b",subwin,8,135,LTC_WIDTH-8,LTC_MASTER_HEIGHT-10); Add(box2);
   status_title.Create(chart,name+"t",subwin,120,10,280,30); status_title.Text("ACTIVE STATUS"); Add(status_title);
   btn.Create(chart,name+"btn",subwin,150,60,245,88); btn.Text("ON"); btn.ColorBackground(LTC_BLUE); Add(btn);
   status_text.Create(chart,name+"st",subwin,120,98,300,118); status_text.Text("Copier is stopped"); Add(status_text);
   edt_channel.Create(chart,name+"ch",subwin,160,156,350,178); edt_channel.Text("ayush"); Add(edt_channel);
   chk_buy.Create(chart,name+"buy",subwin,160,183,210,203); chk_buy.Text("Buy"); chk_buy.Checked(true); Add(chk_buy);
   chk_sell.Create(chart,name+"sell",subwin,215,183,270,203); chk_sell.Text("Sell"); chk_sell.Checked(true); Add(chk_sell);
   chk_pending.Create(chart,name+"pend",subwin,275,183,350,203); chk_pending.Text("Pending"); chk_pending.Checked(true); Add(chk_pending);
   chk_sl.Create(chart,name+"sl",subwin,160,208,210,228); chk_sl.Text("SL"); chk_sl.Checked(true); Add(chk_sl);
   chk_tp.Create(chart,name+"tp",subwin,215,208,265,228); chk_tp.Text("TP"); chk_tp.Checked(true); Add(chk_tp);
   cmb_time.Create(chart,name+"time",subwin,160,336,350,358); cmb_time.ItemAdd("Disabled"); cmb_time.ItemAdd("Not copy in time period"); cmb_time.Select(1); Add(cmb_time);
   edt_from.Create(chart,name+"from",subwin,200,366,250,388); edt_from.Text("hh:mm"); Add(edt_from);
   edt_to.Create(chart,name+"to",subwin,285,366,335,388); edt_to.Text("hh:mm"); Add(edt_to);
   return true;
}

bool MT4MasterWindow::OnEvent(const int id,const long &lparam,const double &dparam,const string &sparam)
{
   if(id==CHARTEVENT_OBJECT_CLICK && sparam==btn.Name())
   {
      running=!running;
      btn.Text(running ? "OFF" : "ON");
      btn.ColorBackground(running ? clrTomato : LTC_BLUE);
      SetStatus(running ? "Copier is running" : "Copier is stopped");
      return true;
   }
   return CAppDialog::OnEvent(id,lparam,dparam,sparam);
}

MT4MasterWindow UI4;

void MT4WriteState()
{
   string keys[], vals[];
   ArrayResize(keys,7); ArrayResize(vals,7);
   keys[0]="status"; vals[0]=UI4.IsRunning() ? "ONLINE" : "OFFLINE";
   keys[1]="channel"; vals[1]=LTCSafeChannelName(UI4.Channel());
   keys[2]="updated_ts"; vals[2]=(string)TimeCurrent();
   keys[3]="updated"; vals[3]=TimeToString(TimeCurrent(),TIME_DATE|TIME_SECONDS);
   keys[4]="master_name"; vals[4]=AccountName();
   keys[5]="login"; vals[5]=(string)AccountNumber();
   keys[6]="platform"; vals[6]="MT4";
   LTCWriteKeyValue(LTCMasterStateFile(UI4.Channel()),keys,vals);
}

void MT4WriteTrades()
{
   if(!UI4.IsRunning()) return;
   LTCEnsureBridgeFolder();
   int handle = FileOpen(LTCMasterTradesFile(UI4.Channel()),FILE_WRITE|FILE_CSV|FILE_COMMON|FILE_ANSI,';');
   if(handle==INVALID_HANDLE) return;

   for(int i=OrdersTotal()-1;i>=0;i--)
   {
      if(!OrderSelect(i,SELECT_BY_POS,MODE_TRADES)) continue;
      int type = OrderType();
      int mapped = -1;
      if(type==OP_BUY) mapped=LTC_TYPE_BUY;
      else if(type==OP_SELL) mapped=LTC_TYPE_SELL;
      else if(type==OP_BUYLIMIT) mapped=LTC_TYPE_BUYLIMIT;
      else if(type==OP_SELLLIMIT) mapped=LTC_TYPE_SELLLIMIT;
      else if(type==OP_BUYSTOP) mapped=LTC_TYPE_BUYSTOP;
      else if(type==OP_SELLSTOP) mapped=LTC_TYPE_SELLSTOP;
      if(mapped<0) continue;
      if(mapped==LTC_TYPE_BUY && !UI4.AllowBuy()) continue;
      if(mapped==LTC_TYPE_SELL && !UI4.AllowSell()) continue;
      if(mapped>=LTC_TYPE_BUYLIMIT && !UI4.AllowPending()) continue;
      if(UI4.TimeBlocked()) continue;
      double sl = UI4.CopySL() ? OrderStopLoss() : 0.0;
      double tp = UI4.CopyTP() ? OrderTakeProfit() : 0.0;
      FileWrite(handle,(string)OrderTicket(),OrderSymbol(),(string)mapped,DoubleToString(OrderLots(),2),
                DoubleToString(OrderOpenPrice(),Digits),DoubleToString(sl,Digits),DoubleToString(tp,Digits),
                OrderComment(),(string)OrderMagicNumber());
   }
   FileClose(handle);
}

int init()
{
   if(!UI4.Create(0,"Local Trade Copier",0,20,20,20+LTC_WIDTH,20+LTC_MASTER_HEIGHT))
      return INIT_FAILED;
   EventSetTimer(1);
   UI4.Run();
   return INIT_SUCCEEDED;
}

int deinit()
{
   EventKillTimer();
   MT4WriteState();
   UI4.Destroy(0);
   return 0;
}

int start()
{
   MT4WriteState();
   MT4WriteTrades();
   return 0;
}

void OnTimer()
{
   MT4WriteState();
   MT4WriteTrades();
}

void OnChartEvent(const int id,const long &lparam,const double &dparam,const string &sparam)
{
   UI4.ChartEvent(id,lparam,dparam,sparam);
}

#endif
