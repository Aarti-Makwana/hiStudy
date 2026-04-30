#property strict
#property version   "1.20"
#property description "Unified Local Trade Copier Receiver single-file source"

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
#include <Trade\Trade.mqh>
CTrade trade;

class ReceiverWindow : public CAppDialog
{
private:
   CPanel    active_box, settings_box;
   CButton   btn_toggle, btn_provider;
   CLabel    title_lbl, status_lbl, icon_lbl;
   CLabel    lbl_mode, lbl_slip, lbl_wait, lbl_entry, lbl_exit, lbl_time, lbl_period, lbl_from, lbl_to, lbl_copylots, lbl_scale, lbl_maxlot, lbl_maxtotal, lbl_maxtrades;
   CLabel    lbl_order, lbl_copyfilter, lbl_copysltp, lbl_symbol, lbl_invert, lbl_status_line;
   CEdit     edt_slip, edt_wait, edt_entry, edt_exit, edt_from, edt_to, edt_scale, edt_maxlot, edt_maxtotal, edt_maxtrades, edt_channel;
   CCheckBox chk_mode_remote, chk_mode_local, chk_buy, chk_sell, chk_pending, chk_ep, chk_sl, chk_tp, chk_exit_copy, chk_cpsl, chk_cptp, chk_symbol, chk_invert;
   CComboBox cmb_time, cmb_copylots, cmb_copyby;
   bool      running;

public:
            ReceiverWindow() { running=false; }
   bool     Create(const long chart,const string name,const int subwin,const int x1,const int y1,const int x2,const int y2);
   bool     OnEvent(const int id,const long &lparam,const double &dparam,const string &sparam);
   void     RefreshStatus(const string detail);
   bool     IsRunning() const { return running; }
   string   Channel() { return edt_channel.Text(); }
   bool     AllowType(const int type);
   bool     CopySL() { return chk_cpsl.Checked(); }
   bool     CopyTP() { return chk_cptp.Checked(); }
   bool     CopyExit() { return chk_exit_copy.Checked(); }
   bool     Invert() { return chk_invert.Checked(); }
   double   ScaleFactor() { return MathMax(0.01,StringToDouble(edt_scale.Text())); }
   double   MaxLotPerTrade() { return MathMax(0.0,StringToDouble(edt_maxlot.Text())); }
   double   MaxTotalLots() { return MathMax(0.0,StringToDouble(edt_maxtotal.Text())); }
   int      MaxTrades() { return MathMax(0,(int)StringToInteger(edt_maxtrades.Text())); }
   bool     TimeBlocked() { return cmb_time.Select()==0 ? false : LTCIsBlockedByTime(edt_from.Text(),edt_to.Text()); }
private:
   void     Toggle();
};

bool ReceiverWindow::Create(const long chart,const string name,const int subwin,const int x1,const int y1,const int x2,const int y2)
{
   if(!CAppDialog::Create(chart,name,subwin,x1,y1,x2,y2))
      return false;
   active_box.Create(chart,name+"A",subwin,8,40,LTC_WIDTH-8,122); Add(active_box);
   settings_box.Create(chart,name+"S",subwin,8,132,LTC_WIDTH-8,LTC_RECEIVER_HEIGHT-12); Add(settings_box);
   title_lbl.Create(chart,name+"t",subwin,110,10,270,30); title_lbl.Text("ACTIVE STATUS"); Add(title_lbl);
   btn_toggle.Create(chart,name+"b",subwin,150,60,235,88); btn_toggle.Text("ON"); btn_toggle.ColorBackground(LTC_ORANGE); Add(btn_toggle);
   icon_lbl.Create(chart,name+"i",subwin,250,60,310,88); icon_lbl.Text(")))[]"); Add(icon_lbl);
   status_lbl.Create(chart,name+"s",subwin,115,95,300,115); status_lbl.Text("Disconnected"); Add(status_lbl);
   edt_channel.Create(chart,name+"channel",subwin,20,155,110,183); edt_channel.Text("ayush"); Add(edt_channel);
   btn_provider.Create(chart,name+"bp",subwin,120,155,275,183); btn_provider.Text("Provider List >>>"); btn_provider.ColorBackground(LTC_ORANGE); Add(btn_provider);
   lbl_mode.Create(chart,name+"lm",subwin,112,194,150,214); lbl_mode.Text("Mode :"); Add(lbl_mode);
   chk_mode_remote.Create(chart,name+"mr",subwin,155,194,220,214); chk_mode_remote.Text("Remote"); Add(chk_mode_remote);
   chk_mode_local.Create(chart,name+"ml",subwin,240,194,295,214); chk_mode_local.Text("Local"); chk_mode_local.Checked(true); Add(chk_mode_local);
   lbl_slip.Create(chart,name+"ls",subwin,56,230,150,250); lbl_slip.Text("Max. Slippage :"); Add(lbl_slip);
   edt_slip.Create(chart,name+"es",subwin,160,228,210,250); edt_slip.Text("0.5"); Add(edt_slip);
   cmb_copyby.Create(chart,name+"cs1",subwin,220,228,350,250); cmb_copyby.ItemAdd("% of entry price"); cmb_copyby.ItemAdd("points"); cmb_copyby.Select(0); Add(cmb_copyby);
   lbl_wait.Create(chart,name+"lw",subwin,44,255,150,275); lbl_wait.Text("Max. Waiting Time :"); Add(lbl_wait);
   edt_wait.Create(chart,name+"ew",subwin,160,253,210,275); edt_wait.Text("0"); Add(edt_wait);
   lbl_status_line.Create(chart,name+"inf",subwin,220,255,320,275); lbl_status_line.Text("(infinity)"); Add(lbl_status_line);
   lbl_entry.Create(chart,name+"le",subwin,83,280,150,300); lbl_entry.Text("Entry Delay :"); Add(lbl_entry);
   edt_entry.Create(chart,name+"ee",subwin,160,278,210,300); edt_entry.Text("0"); Add(edt_entry);
   lbl_exit.Create(chart,name+"lex",subwin,94,305,150,325); lbl_exit.Text("Exit Delay :"); Add(lbl_exit);
   edt_exit.Create(chart,name+"ex",subwin,160,303,210,325); edt_exit.Text("0"); Add(edt_exit);
   lbl_time.Create(chart,name+"lt",subwin,79,330,150,350); lbl_time.Text("Time Filter :"); Add(lbl_time);
   cmb_time.Create(chart,name+"ct",subwin,160,328,350,350); cmb_time.ItemAdd("Disabled"); cmb_time.ItemAdd("Not copy in time period"); cmb_time.Select(1); Add(cmb_time);
   lbl_period.Create(chart,name+"lp",subwin,40,355,150,375); lbl_period.Text("Time Filter Period :"); Add(lbl_period);
   lbl_from.Create(chart,name+"lf",subwin,160,355,195,375); lbl_from.Text("From"); Add(lbl_from);
   edt_from.Create(chart,name+"ef",subwin,195,353,245,375); edt_from.Text("hh:mm"); Add(edt_from);
   lbl_to.Create(chart,name+"lto",subwin,260,355,280,375); lbl_to.Text("To"); Add(lbl_to);
   edt_to.Create(chart,name+"et",subwin,285,353,335,375); edt_to.Text("hh:mm"); Add(edt_to);
   lbl_copylots.Create(chart,name+"lcl",subwin,78,390,150,410); lbl_copylots.Text("Copy Lots by :"); Add(lbl_copylots);
   cmb_copylots.Create(chart,name+"ccl",subwin,160,388,350,410); cmb_copylots.ItemAdd("Provider risk scaling"); cmb_copylots.ItemAdd("Fixed multiply"); cmb_copylots.Select(0); Add(cmb_copylots);
   lbl_scale.Create(chart,name+"lsc",subwin,91,415,150,435); lbl_scale.Text("Scale Factor :"); Add(lbl_scale);
   edt_scale.Create(chart,name+"esc",subwin,160,413,210,435); edt_scale.Text("1"); Add(edt_scale);
   lbl_maxlot.Create(chart,name+"lml",subwin,58,440,150,460); lbl_maxlot.Text("Max. Lots Per Trade :"); Add(lbl_maxlot);
   edt_maxlot.Create(chart,name+"eml",subwin,160,438,210,460); edt_maxlot.Text("0"); Add(edt_maxlot);
   lbl_maxtotal.Create(chart,name+"lmt",subwin,72,465,150,485); lbl_maxtotal.Text("Max. Total Lots :"); Add(lbl_maxtotal);
   edt_maxtotal.Create(chart,name+"emt",subwin,160,463,210,485); edt_maxtotal.Text("0"); Add(edt_maxtotal);
   lbl_maxtrades.Create(chart,name+"lmx",subwin,92,490,150,510); lbl_maxtrades.Text("Max. Trades :"); Add(lbl_maxtrades);
   edt_maxtrades.Create(chart,name+"emx",subwin,160,488,210,510); edt_maxtrades.Text("0"); Add(edt_maxtrades);
   lbl_order.Create(chart,name+"lo",subwin,88,525,150,545); lbl_order.Text("Order Filter :"); Add(lbl_order);
   chk_buy.Create(chart,name+"buy",subwin,160,525,210,545); chk_buy.Text("Buy"); chk_buy.Checked(true); Add(chk_buy);
   chk_sell.Create(chart,name+"sell",subwin,215,525,270,545); chk_sell.Text("Sell"); chk_sell.Checked(true); Add(chk_sell);
   chk_pending.Create(chart,name+"pend",subwin,275,525,350,545); chk_pending.Text("Pending"); chk_pending.Checked(true); Add(chk_pending);
   lbl_copyfilter.Create(chart,name+"lcf",subwin,100,550,150,570); lbl_copyfilter.Text("Copy Filter :"); Add(lbl_copyfilter);
   chk_ep.Create(chart,name+"ep",subwin,160,550,205,570); chk_ep.Text("EP"); chk_ep.Checked(true); Add(chk_ep);
   chk_sl.Create(chart,name+"sl",subwin,210,550,255,570); chk_sl.Text("SL"); chk_sl.Checked(true); Add(chk_sl);
   chk_tp.Create(chart,name+"tp",subwin,260,550,305,570); chk_tp.Text("TP"); chk_tp.Checked(true); Add(chk_tp);
   chk_exit_copy.Create(chart,name+"exi",subwin,310,550,355,570); chk_exit_copy.Text("Exit"); chk_exit_copy.Checked(true); Add(chk_exit_copy);
   lbl_copysltp.Create(chart,name+"lcst",subwin,68,575,150,595); lbl_copysltp.Text("Copy SL&TP Change :"); Add(lbl_copysltp);
   chk_cpsl.Create(chart,name+"cpsl",subwin,160,575,210,595); chk_cpsl.Text("SL"); chk_cpsl.Checked(true); Add(chk_cpsl);
   chk_cptp.Create(chart,name+"cptp",subwin,215,575,265,595); chk_cptp.Text("TP"); chk_cptp.Checked(true); Add(chk_cptp);
   lbl_symbol.Create(chart,name+"lsym",subwin,82,600,150,620); lbl_symbol.Text("Symbol Filter :"); Add(lbl_symbol);
   chk_symbol.Create(chart,name+"sym",subwin,160,600,180,620); Add(chk_symbol);
   lbl_invert.Create(chart,name+"linv",subwin,70,625,150,645); lbl_invert.Text("Inverted copy :"); Add(lbl_invert);
   chk_invert.Create(chart,name+"inv",subwin,160,625,180,645); Add(chk_invert);
   RefreshStatus("Disconnected");
   return true;
}

bool ReceiverWindow::AllowType(const int type)
{
   if(type == LTC_TYPE_BUY) return chk_buy.Checked();
   if(type == LTC_TYPE_SELL) return chk_sell.Checked();
   return chk_pending.Checked();
}

void ReceiverWindow::RefreshStatus(const string detail) { status_lbl.Text(detail); }
void ReceiverWindow::Toggle() { running = !running; btn_toggle.Text(running ? "OFF" : "ON"); btn_toggle.ColorBackground(running ? clrTomato : LTC_ORANGE); RefreshStatus(running ? "Connected to the provider" : "Disconnected"); }
bool ReceiverWindow::OnEvent(const int id,const long &lparam,const double &dparam,const string &sparam) { if(id == CHARTEVENT_OBJECT_CLICK && sparam == btn_toggle.Name()) { Toggle(); return true; } return CAppDialog::OnEvent(id,lparam,dparam,sparam); }

ReceiverWindow UI;

string ResolveSymbolMT5(const string master_symbol) { if(SymbolSelect(master_symbol,true)) return master_symbol; int total = SymbolsTotal(false); for(int i=0;i<total;i++) { string candidate = SymbolName(i,false); if(StringFind(candidate,master_symbol) >= 0 || StringFind(master_symbol,candidate) >= 0) return candidate; } return master_symbol; }
int ReceiverOpenTradesCount() { int count = 0; for(int i=0;i<PositionsTotal();i++) { ulong ticket = PositionGetTicket(i); if(PositionSelectByTicket(ticket) && StringFind(PositionGetString(POSITION_COMMENT),"LTC#") == 0) count++; } return count; }
double ReceiverTotalLots() { double total = 0.0; for(int i=0;i<PositionsTotal();i++) { ulong ticket = PositionGetTicket(i); if(PositionSelectByTicket(ticket) && StringFind(PositionGetString(POSITION_COMMENT),"LTC#") == 0) total += PositionGetDouble(POSITION_VOLUME); } return total; }

bool PublishReceiverState()
{
   string keys[], vals[]; ArrayResize(keys,6); ArrayResize(vals,6);
   keys[0]="status"; vals[0]=UI.IsRunning() ? "ACTIVE" : "IDLE";
   keys[1]="channel"; vals[1]=LTCSafeChannelName(UI.Channel());
   keys[2]="updated_ts"; vals[2]=(string)TimeCurrent();
   keys[3]="updated"; vals[3]=TimeToString(TimeCurrent(),TIME_DATE|TIME_SECONDS);
   keys[4]="platform"; vals[4]="MT5";
   keys[5]="login"; vals[5]=(string)AccountInfoInteger(ACCOUNT_LOGIN);
   return LTCWriteKeyValue(LTCReceiverStateFile(UI.Channel(),(long)AccountInfoInteger(ACCOUNT_LOGIN)),keys,vals);
}

bool ModifyPositionByTicket(const ulong ticket,const double sl,const double tp) { if(!PositionSelectByTicket(ticket)) return false; return trade.PositionModify(PositionGetString(POSITION_SYMBOL),sl,tp); }
bool ClosePositionByTicket(const ulong ticket) { return trade.PositionClose(ticket); }
bool DeleteOrderByTicket(const ulong ticket) { return trade.OrderDelete(ticket); }

bool PlaceTradeFromRow(const LTCTradeRow &row,long &local_ticket)
{
   string symbol = ResolveSymbolMT5(row.symbol);
   if(!SymbolSelect(symbol,true)) return false;
   int type = row.order_type;
   if(UI.Invert()) { if(type == LTC_TYPE_BUY) type = LTC_TYPE_SELL; else if(type == LTC_TYPE_SELL) type = LTC_TYPE_BUY; else if(type == LTC_TYPE_BUYLIMIT) type = LTC_TYPE_SELLLIMIT; else if(type == LTC_TYPE_SELLLIMIT) type = LTC_TYPE_BUYLIMIT; else if(type == LTC_TYPE_BUYSTOP) type = LTC_TYPE_SELLSTOP; else if(type == LTC_TYPE_SELLSTOP) type = LTC_TYPE_BUYSTOP; }
   if(!UI.AllowType(type) || UI.TimeBlocked()) return false;
   double volume = row.volume * UI.ScaleFactor();
   double step = SymbolInfoDouble(symbol,SYMBOL_VOLUME_STEP), minv = SymbolInfoDouble(symbol,SYMBOL_VOLUME_MIN), maxv = SymbolInfoDouble(symbol,SYMBOL_VOLUME_MAX);
   if(step > 0.0) volume = MathFloor(volume/step)*step;
   volume = MathMax(minv,MathMin(maxv,volume));
   if(UI.MaxLotPerTrade() > 0.0) volume = MathMin(volume,UI.MaxLotPerTrade());
   if(UI.MaxTotalLots() > 0.0 && ReceiverTotalLots() + volume > UI.MaxTotalLots()) return false;
   if(UI.MaxTrades() > 0 && ReceiverOpenTradesCount() >= UI.MaxTrades()) return false;
   string comment = "LTC#" + (string)row.master_ticket;
   double sl = UI.CopySL() ? row.sl : 0.0, tp = UI.CopyTP() ? row.tp : 0.0;
   trade.SetExpertMagicNumber(55001);
   bool ok = false;
   if(type == LTC_TYPE_BUY) ok = trade.Buy(volume,symbol,0.0,sl,tp,comment);
   else if(type == LTC_TYPE_SELL) ok = trade.Sell(volume,symbol,0.0,sl,tp,comment);
   else if(type == LTC_TYPE_BUYLIMIT) ok = trade.BuyLimit(volume,row.price,symbol,sl,tp,ORDER_TIME_GTC,0,comment);
   else if(type == LTC_TYPE_SELLLIMIT) ok = trade.SellLimit(volume,row.price,symbol,sl,tp,ORDER_TIME_GTC,0,comment);
   else if(type == LTC_TYPE_BUYSTOP) ok = trade.BuyStop(volume,row.price,symbol,sl,tp,ORDER_TIME_GTC,0,comment);
   else if(type == LTC_TYPE_SELLSTOP) ok = trade.SellStop(volume,row.price,symbol,sl,tp,ORDER_TIME_GTC,0,comment);
   if(!ok) return false;
   local_ticket = (long)trade.ResultOrder(); if(local_ticket == 0) local_ticket = (long)trade.ResultDeal();
   return (local_ticket > 0);
}

bool LocalTicketExists(const long ticket,const int order_type) { if(order_type == LTC_TYPE_BUY || order_type == LTC_TYPE_SELL) return PositionSelectByTicket((ulong)ticket); return OrderSelect((ulong)ticket); }

void SyncReceiver()
{
   PublishReceiverState();
   if(!UI.IsRunning()) return;
   if(LTCReadValue(LTCMasterStateFile(UI.Channel()),"status") != "ONLINE") { UI.RefreshStatus("Waiting for provider..."); return; }
   LTCTradeRow rows[]; if(!LTCLoadTradeRows(LTCMasterTradesFile(UI.Channel()),rows)) { UI.RefreshStatus("Trade feed not found"); return; }
   LTCMapRow maps[]; LTCLoadMapRows(LTCMapFile(UI.Channel(),(long)AccountInfoInteger(ACCOUNT_LOGIN)),maps);
   for(int i=0;i<ArraySize(rows);i++)
   {
      int map_idx = LTCFindMapIndex(maps,rows[i].master_ticket);
      if(map_idx < 0)
      {
         long local_ticket = 0;
         if(PlaceTradeFromRow(rows[i],local_ticket))
         {
            int new_pos = ArraySize(maps); ArrayResize(maps,new_pos+1);
            maps[new_pos].master_ticket = rows[i].master_ticket; maps[new_pos].local_ticket  = local_ticket; maps[new_pos].order_type    = rows[i].order_type;
         }
      }
      else if((rows[i].order_type == LTC_TYPE_BUY || rows[i].order_type == LTC_TYPE_SELL) && LocalTicketExists(maps[map_idx].local_ticket,maps[map_idx].order_type))
      {
         if(UI.CopySL() || UI.CopyTP()) ModifyPositionByTicket((ulong)maps[map_idx].local_ticket,UI.CopySL() ? rows[i].sl : 0.0,UI.CopyTP() ? rows[i].tp : 0.0);
      }
   }
   if(UI.CopyExit())
   {
      for(int i=ArraySize(maps)-1;i>=0;i--)
      {
         bool still_exists = false; for(int j=0;j<ArraySize(rows);j++) if(rows[j].master_ticket == maps[i].master_ticket) { still_exists = true; break; }
         if(still_exists) continue;
         if(LocalTicketExists(maps[i].local_ticket,maps[i].order_type)) { if(maps[i].order_type == LTC_TYPE_BUY || maps[i].order_type == LTC_TYPE_SELL) ClosePositionByTicket((ulong)maps[i].local_ticket); else DeleteOrderByTicket((ulong)maps[i].local_ticket); }
         for(int k=i;k<ArraySize(maps)-1;k++) maps[k] = maps[k+1];
         ArrayResize(maps,ArraySize(maps)-1);
      }
   }
   LTCSaveMapRows(LTCMapFile(UI.Channel(),(long)AccountInfoInteger(ACCOUNT_LOGIN)),maps);
   UI.RefreshStatus("Connected to the provider");
}

int OnInit() { if(!UI.Create(0,"Trade Receiver Free",0,20,20,20+LTC_WIDTH,20+LTC_RECEIVER_HEIGHT)) return INIT_FAILED; EventSetTimer(1); UI.Run(); return INIT_SUCCEEDED; }
void OnDeinit(const int reason) { EventKillTimer(); PublishReceiverState(); UI.Destroy(reason); }
void OnTimer() { SyncReceiver(); }
void OnChartEvent(const int id,const long &lparam,const double &dparam,const string &sparam) { UI.ChartEvent(id,lparam,dparam,sparam); }

#else

class MT4ReceiverWindow : public CAppDialog
{
private:
   CPanel box1, box2; CButton btn; CLabel status_text;
   CEdit edt_channel, edt_scale, edt_maxlot, edt_maxtotal, edt_maxtrades, edt_from, edt_to;
   CCheckBox chk_buy, chk_sell, chk_pending, chk_exit, chk_sl, chk_tp, chk_invert;
   CComboBox cmb_time; bool running;
public:
   MT4ReceiverWindow(){ running=false; }
   bool Create(const long chart,const string name,const int subwin,const int x1,const int y1,const int x2,const int y2);
   bool OnEvent(const int id,const long &lparam,const double &dparam,const string &sparam);
   bool IsRunning() const { return running; }
   string Channel(){ return edt_channel.Text(); }
   bool AllowType(const int type){ if(type==LTC_TYPE_BUY) return chk_buy.Checked(); if(type==LTC_TYPE_SELL) return chk_sell.Checked(); return chk_pending.Checked(); }
   bool CopyExit(){ return chk_exit.Checked(); } bool CopySL(){ return chk_sl.Checked(); } bool CopyTP(){ return chk_tp.Checked(); } bool Invert(){ return chk_invert.Checked(); }
   double Scale(){ return MathMax(0.01,StringToDouble(edt_scale.Text())); } double MaxLot(){ return MathMax(0.0,StringToDouble(edt_maxlot.Text())); } double MaxTotal(){ return MathMax(0.0,StringToDouble(edt_maxtotal.Text())); }
   int MaxTrades(){ return MathMax(0,StringToInteger(edt_maxtrades.Text())); } bool TimeBlocked(){ return cmb_time.Select()==0 ? false : LTCIsBlockedByTime(edt_from.Text(),edt_to.Text()); }
   void SetStatus(const string text){ status_text.Text(text); }
};

bool MT4ReceiverWindow::Create(const long chart,const string name,const int subwin,const int x1,const int y1,const int x2,const int y2)
{
   if(!CAppDialog::Create(chart,name,subwin,x1,y1,x2,y2)) return false;
   box1.Create(chart,name+"a",subwin,8,40,LTC_WIDTH-8,122); Add(box1); box2.Create(chart,name+"b",subwin,8,132,LTC_WIDTH-8,LTC_RECEIVER_HEIGHT-12); Add(box2);
   btn.Create(chart,name+"btn",subwin,150,60,235,88); btn.Text("ON"); btn.ColorBackground(LTC_ORANGE); Add(btn);
   status_text.Create(chart,name+"st",subwin,112,95,300,115); status_text.Text("Disconnected"); Add(status_text);
   edt_channel.Create(chart,name+"ch",subwin,20,155,110,183); edt_channel.Text("ayush"); Add(edt_channel);
   edt_scale.Create(chart,name+"sc",subwin,160,413,210,435); edt_scale.Text("1"); Add(edt_scale);
   edt_maxlot.Create(chart,name+"ml",subwin,160,438,210,460); edt_maxlot.Text("0"); Add(edt_maxlot);
   edt_maxtotal.Create(chart,name+"mt",subwin,160,463,210,485); edt_maxtotal.Text("0"); Add(edt_maxtotal);
   edt_maxtrades.Create(chart,name+"mx",subwin,160,488,210,510); edt_maxtrades.Text("0"); Add(edt_maxtrades);
   chk_buy.Create(chart,name+"buy",subwin,160,525,210,545); chk_buy.Text("Buy"); chk_buy.Checked(true); Add(chk_buy);
   chk_sell.Create(chart,name+"sell",subwin,215,525,270,545); chk_sell.Text("Sell"); chk_sell.Checked(true); Add(chk_sell);
   chk_pending.Create(chart,name+"pend",subwin,275,525,350,545); chk_pending.Text("Pending"); chk_pending.Checked(true); Add(chk_pending);
   chk_exit.Create(chart,name+"exit",subwin,310,550,355,570); chk_exit.Text("Exit"); chk_exit.Checked(true); Add(chk_exit);
   chk_sl.Create(chart,name+"sl",subwin,160,575,210,595); chk_sl.Text("SL"); chk_sl.Checked(true); Add(chk_sl);
   chk_tp.Create(chart,name+"tp",subwin,215,575,265,595); chk_tp.Text("TP"); chk_tp.Checked(true); Add(chk_tp);
   chk_invert.Create(chart,name+"inv",subwin,160,625,180,645); Add(chk_invert);
   cmb_time.Create(chart,name+"time",subwin,160,328,350,350); cmb_time.ItemAdd("Disabled"); cmb_time.ItemAdd("Not copy in time period"); cmb_time.Select(1); Add(cmb_time);
   edt_from.Create(chart,name+"from",subwin,195,353,245,375); edt_from.Text("hh:mm"); Add(edt_from);
   edt_to.Create(chart,name+"to",subwin,285,353,335,375); edt_to.Text("hh:mm"); Add(edt_to);
   return true;
}

bool MT4ReceiverWindow::OnEvent(const int id,const long &lparam,const double &dparam,const string &sparam) { if(id==CHARTEVENT_OBJECT_CLICK && sparam==btn.Name()) { running=!running; btn.Text(running ? "OFF" : "ON"); btn.ColorBackground(running ? clrTomato : LTC_ORANGE); SetStatus(running ? "Connected to the provider" : "Disconnected"); return true; } return CAppDialog::OnEvent(id,lparam,dparam,sparam); }
MT4ReceiverWindow R4;
double MT4ReceiverLots() { double total=0; for(int i=OrdersTotal()-1;i>=0;i--) if(OrderSelect(i,SELECT_BY_POS,MODE_TRADES) && StringFind(OrderComment(),"LTC#")==0) total+=OrderLots(); return total; }
int MT4ReceiverTrades() { int total=0; for(int i=OrdersTotal()-1;i>=0;i--) if(OrderSelect(i,SELECT_BY_POS,MODE_TRADES) && StringFind(OrderComment(),"LTC#")==0) total++; return total; }
bool MT4PublishState() { string keys[], vals[]; ArrayResize(keys,6); ArrayResize(vals,6); keys[0]="status"; vals[0]=R4.IsRunning() ? "ACTIVE" : "IDLE"; keys[1]="channel"; vals[1]=LTCSafeChannelName(R4.Channel()); keys[2]="updated_ts"; vals[2]=(string)TimeCurrent(); keys[3]="updated"; vals[3]=TimeToString(TimeCurrent(),TIME_DATE|TIME_SECONDS); keys[4]="platform"; vals[4]="MT4"; keys[5]="login"; vals[5]=(string)AccountNumber(); return LTCWriteKeyValue(LTCReceiverStateFile(R4.Channel(),AccountNumber()),keys,vals); }
bool MT4LocalOrderExists(const long ticket) { return OrderSelect(ticket,SELECT_BY_TICKET); }
int MT4ConvertType(int type) { if(R4.Invert()) { if(type==LTC_TYPE_BUY) type=LTC_TYPE_SELL; else if(type==LTC_TYPE_SELL) type=LTC_TYPE_BUY; else if(type==LTC_TYPE_BUYLIMIT) type=LTC_TYPE_SELLLIMIT; else if(type==LTC_TYPE_SELLLIMIT) type=LTC_TYPE_BUYLIMIT; else if(type==LTC_TYPE_BUYSTOP) type=LTC_TYPE_SELLSTOP; else if(type==LTC_TYPE_SELLSTOP) type=LTC_TYPE_BUYSTOP; } if(type==LTC_TYPE_BUY) return OP_BUY; if(type==LTC_TYPE_SELL) return OP_SELL; if(type==LTC_TYPE_BUYLIMIT) return OP_BUYLIMIT; if(type==LTC_TYPE_SELLLIMIT) return OP_SELLLIMIT; if(type==LTC_TYPE_BUYSTOP) return OP_BUYSTOP; if(type==LTC_TYPE_SELLSTOP) return OP_SELLSTOP; return -1; }
string MT4ResolveSymbol(const string master_symbol) { if(MarketInfo(master_symbol,MODE_POINT) > 0) return master_symbol; for(int i=0;i<SymbolsTotal(false);i++) { string candidate = SymbolName(i,false); if(StringFind(candidate,master_symbol)>=0 || StringFind(master_symbol,candidate)>=0) return candidate; } return master_symbol; }

bool MT4OpenFromRow(const LTCTradeRow &row,long &local_ticket)
{
   if(!R4.AllowType(row.order_type) || R4.TimeBlocked()) return false;
   int order_type = MT4ConvertType(row.order_type); if(order_type < 0) return false;
   string symbol = MT4ResolveSymbol(row.symbol);
   double lots = row.volume * R4.Scale(), minlot = MarketInfo(symbol,MODE_MINLOT), maxlot = MarketInfo(symbol,MODE_MAXLOT), step = MarketInfo(symbol,MODE_LOTSTEP);
   if(step > 0) lots = MathFloor(lots/step)*step;
   lots = MathMax(minlot,MathMin(maxlot,lots));
   if(R4.MaxLot() > 0) lots = MathMin(lots,R4.MaxLot());
   if(R4.MaxTotal() > 0 && MT4ReceiverLots()+lots > R4.MaxTotal()) return false;
   if(R4.MaxTrades() > 0 && MT4ReceiverTrades() >= R4.MaxTrades()) return false;
   double price = row.price; if(order_type==OP_BUY) price = MarketInfo(symbol,MODE_ASK); if(order_type==OP_SELL) price = MarketInfo(symbol,MODE_BID);
   double sl = R4.CopySL() ? row.sl : 0.0, tp = R4.CopyTP() ? row.tp : 0.0;
   int ticket = OrderSend(symbol,order_type,lots,price,5,sl,tp,"LTC#" + (string)row.master_ticket,55001,0,clrOrange);
   if(ticket <= 0) return false; local_ticket = ticket; return true;
}

void MT4Sync()
{
   MT4PublishState();
   if(!R4.IsRunning()) return;
   if(LTCReadValue(LTCMasterStateFile(R4.Channel()),"status") != "ONLINE") { R4.SetStatus("Waiting for provider..."); return; }
   LTCTradeRow rows[]; if(!LTCLoadTradeRows(LTCMasterTradesFile(R4.Channel()),rows)) return;
   LTCMapRow maps[]; LTCLoadMapRows(LTCMapFile(R4.Channel(),AccountNumber()),maps);
   for(int i=0;i<ArraySize(rows);i++)
   {
      int idx = LTCFindMapIndex(maps,rows[i].master_ticket);
      if(idx < 0)
      {
         long local_ticket=0;
         if(MT4OpenFromRow(rows[i],local_ticket))
         {
            int p=ArraySize(maps); ArrayResize(maps,p+1); maps[p].master_ticket=rows[i].master_ticket; maps[p].local_ticket=local_ticket; maps[p].order_type=rows[i].order_type;
         }
      }
      else if((rows[i].order_type==LTC_TYPE_BUY || rows[i].order_type==LTC_TYPE_SELL) && MT4LocalOrderExists(maps[idx].local_ticket))
      {
         if(R4.CopySL() || R4.CopyTP()) OrderModify(maps[idx].local_ticket,OrderOpenPrice(),R4.CopySL()?rows[i].sl:OrderStopLoss(),R4.CopyTP()?rows[i].tp:OrderTakeProfit(),0,clrNONE);
      }
   }
   if(R4.CopyExit())
   {
      for(int i=ArraySize(maps)-1;i>=0;i--)
      {
         bool exists=false; for(int j=0;j<ArraySize(rows);j++) if(rows[j].master_ticket==maps[i].master_ticket){ exists=true; break; }
         if(exists) continue;
         if(MT4LocalOrderExists(maps[i].local_ticket)) { int type=OrderType(); if(type==OP_BUY) OrderClose(OrderTicket(),OrderLots(),Bid,5,clrNONE); else if(type==OP_SELL) OrderClose(OrderTicket(),OrderLots(),Ask,5,clrNONE); else OrderDelete(OrderTicket()); }
         for(int k=i;k<ArraySize(maps)-1;k++) maps[k]=maps[k+1];
         ArrayResize(maps,ArraySize(maps)-1);
      }
   }
   LTCSaveMapRows(LTCMapFile(R4.Channel(),AccountNumber()),maps);
   R4.SetStatus("Connected to the provider");
}

int init() { if(!R4.Create(0,"Trade Receiver Free",0,20,20,20+LTC_WIDTH,20+LTC_RECEIVER_HEIGHT)) return INIT_FAILED; EventSetTimer(1); R4.Run(); return INIT_SUCCEEDED; }
int deinit() { EventKillTimer(); MT4PublishState(); R4.Destroy(0); return 0; }
int start() { MT4Sync(); return 0; }
void OnTimer() { MT4Sync(); }
void OnChartEvent(const int id,const long &lparam,const double &dparam,const string &sparam) { R4.ChartEvent(id,lparam,dparam,sparam); }

#endif
