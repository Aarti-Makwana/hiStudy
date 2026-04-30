//+------------------------------------------------------------------+
//|                                               MasterCopier_UI.mq5|
//|                                Copyright 2026, Trading AI Corp   |
//+------------------------------------------------------------------+
#property copyright "Copyright 2026"
#property version   "9.00"
#property strict

#include <Controls\Dialog.mqh>
#include <Controls\Button.mqh>
#include <Controls\Edit.mqh>
#include <Controls\Label.mqh>
#include <Controls\ComboBox.mqh>
#include <Controls\Panel.mqh>

#define CLR_MAIN_BG       C'9,14,22'
#define CLR_SHELL         C'16,24,34'
#define CLR_CARD          C'22,33,47'
#define CLR_CARD_ALT      C'29,43,60'
#define CLR_ACCENT        C'0,198,255'
#define CLR_ACCENT_SOFT   C'38,94,120'
#define CLR_SUCCESS       C'32,201,151'
#define CLR_WARNING       C'255,184,77'
#define CLR_DANGER        C'232,76,61'
#define CLR_TEXT          C'239,245,250'
#define CLR_MUTED         C'145,164,180'
#define CLR_BORDER        C'55,76,97'

#define WIDTH             440
#define HEIGHT            620
#define BRIDGE_FOLDER     "TradeBridge"

class MasterCopierUI : public CAppDialog
{
private:
   CPanel      m_shell_panel;
   CPanel      m_header_panel;
   CPanel      m_channel_card;
   CPanel      m_snapshot_card;
   CPanel      m_settings_card;

   CLabel      m_lbl_brand;
   CLabel      m_lbl_subtitle;
   CLabel      m_lbl_status_chip;
   CLabel      m_lbl_status_hint;

   CButton     m_btn_toggle;
   CEdit       m_status_bar;

   CLabel      m_lbl_channel_sec;
   CLabel      m_lbl_channel_hint;
   CEdit       m_edt_channel;

   CLabel      m_lbl_snapshot_sec;
   CLabel      m_lbl_master_name;
   CLabel      m_lbl_account;
   CLabel      m_lbl_balance;
   CLabel      m_lbl_symbol;
   CLabel      m_lbl_price;
   CLabel      m_lbl_updated;

   CLabel      m_lbl_settings_sec;
   CLabel      m_lbl_symbol_mode;
   CComboBox   m_combo_symbol_mode;
   CLabel      m_lbl_note;
   CEdit       m_edt_note;

   bool        m_is_active;
   string      m_channel_name;

public:
               MasterCopierUI(void) : m_is_active(false), m_channel_name("") {}
   virtual bool Create(const long chart,const string name,const int subwin,const int x1,const int y1,const int x2,const int y2);
   virtual bool OnEvent(const int id,const long &lparam,const double &dparam,const string &sparam);

   void        RefreshBroadcast(void);

protected:
   void        ToggleStatus(void);
   bool        StartBroadcast(void);
   void        StopBroadcast(void);
   bool        PublishSnapshot(const string status_text);
   string      SnapshotFileName(void) const;
   string      SafeChannelName(const string channel_text) const;
   void        UpdateSnapshotLabels(void);
   void        SetStatus(const string text,const color text_color);
};

string MasterCopierUI::SafeChannelName(const string channel_text) const
{
   string safe = channel_text;
   StringTrimLeft(safe);
   StringTrimRight(safe);
   StringReplace(safe,"\\","_");
   StringReplace(safe,"/","_");
   StringReplace(safe,":","_");
   StringReplace(safe,"*","_");
   StringReplace(safe,"?","_");
   StringReplace(safe,"\"","_");
   StringReplace(safe,"<","_");
   StringReplace(safe,">","_");
   StringReplace(safe,"|","_");
   StringReplace(safe," ","_");
   return safe;
}

string MasterCopierUI::SnapshotFileName(void) const
{
   return BRIDGE_FOLDER + "\\" + SafeChannelName(m_edt_channel.Text()) + "_master.csv";
}

bool MasterCopierUI::Create(const long chart,const string name,const int subwin,const int x1,const int y1,const int x2,const int y2)
{
   if(!CAppDialog::Create(chart,name,subwin,x1,y1,x2,y2))
      return false;

   m_chart_id = chart;
   ObjectSetInteger(m_chart_id,m_name,OBJPROP_BGCOLOR,CLR_MAIN_BG);

   m_shell_panel.Create(0,m_name+"Shell",0,6,6,WIDTH-6,HEIGHT-6);
   m_shell_panel.ColorBackground(CLR_SHELL);
   m_shell_panel.ColorBorder(CLR_BORDER);
   Add(m_shell_panel);

   m_header_panel.Create(0,m_name+"Hdr",0,18,18,WIDTH-18,138);
   m_header_panel.ColorBackground(CLR_CARD);
   m_header_panel.ColorBorder(CLR_ACCENT_SOFT);
   Add(m_header_panel);

   m_lbl_brand.Create(0,m_name+"Brand",0,34,30,270,54);
   m_lbl_brand.Text("MASTER BROADCASTER");
   m_lbl_brand.Color(CLR_TEXT);
   Add(m_lbl_brand);

   m_lbl_subtitle.Create(0,m_name+"Sub",0,34,55,290,76);
   m_lbl_subtitle.Text("MT5 master terminal snapshot publisher");
   m_lbl_subtitle.Color(CLR_MUTED);
   Add(m_lbl_subtitle);

   m_lbl_status_chip.Create(0,m_name+"Chip",0,292,32,402,56);
   m_lbl_status_chip.Text("IDLE");
   m_lbl_status_chip.Color(CLR_WARNING);
   Add(m_lbl_status_chip);

   m_btn_toggle.Create(0,m_name+"Btn",0,34,88,188,122);
   m_btn_toggle.Text("START CAST");
   m_btn_toggle.ColorBackground(CLR_ACCENT);
   m_btn_toggle.Color(CLR_TEXT);
   Add(m_btn_toggle);

   m_lbl_status_hint.Create(0,m_name+"Hint",0,206,92,404,118);
   m_lbl_status_hint.Text("Ready to publish account data");
   m_lbl_status_hint.Color(CLR_MUTED);
   Add(m_lbl_status_hint);

   m_channel_card.Create(0,m_name+"ChannelCard",0,18,154,WIDTH-18,244);
   m_channel_card.ColorBackground(CLR_CARD);
   m_channel_card.ColorBorder(CLR_BORDER);
   Add(m_channel_card);

   m_lbl_channel_sec.Create(0,m_name+"ChannelSec",0,34,168,220,190);
   m_lbl_channel_sec.Text("CHANNEL");
   m_lbl_channel_sec.Color(CLR_ACCENT);
   Add(m_lbl_channel_sec);

   m_lbl_channel_hint.Create(0,m_name+"ChannelHint",0,34,192,398,212);
   m_lbl_channel_hint.Text("Receivers must use this same room name");
   m_lbl_channel_hint.Color(CLR_MUTED);
   Add(m_lbl_channel_hint);

   m_edt_channel.Create(0,m_name+"Channel",0,34,214,WIDTH-34,238);
   m_edt_channel.Text("MASTER-01");
   m_edt_channel.ColorBackground(CLR_CARD_ALT);
   m_edt_channel.Color(CLR_TEXT);
   Add(m_edt_channel);

   m_snapshot_card.Create(0,m_name+"SnapshotCard",0,18,256,WIDTH-18,404);
   m_snapshot_card.ColorBackground(CLR_CARD);
   m_snapshot_card.ColorBorder(CLR_BORDER);
   Add(m_snapshot_card);

   m_lbl_snapshot_sec.Create(0,m_name+"SnapshotSec",0,34,270,220,292);
   m_lbl_snapshot_sec.Text("LIVE SNAPSHOT");
   m_lbl_snapshot_sec.Color(CLR_SUCCESS);
   Add(m_lbl_snapshot_sec);

   m_lbl_master_name.Create(0,m_name+"MasterName",0,34,300,398,320);
   m_lbl_master_name.Color(CLR_TEXT);
   Add(m_lbl_master_name);

   m_lbl_account.Create(0,m_name+"Account",0,34,324,398,344);
   m_lbl_account.Color(CLR_MUTED);
   Add(m_lbl_account);

   m_lbl_balance.Create(0,m_name+"Balance",0,34,348,398,368);
   m_lbl_balance.Color(CLR_MUTED);
   Add(m_lbl_balance);

   m_lbl_symbol.Create(0,m_name+"Symbol",0,220,324,398,344);
   m_lbl_symbol.Color(CLR_MUTED);
   Add(m_lbl_symbol);

   m_lbl_price.Create(0,m_name+"Price",0,220,348,398,368);
   m_lbl_price.Color(CLR_MUTED);
   Add(m_lbl_price);

   m_lbl_updated.Create(0,m_name+"Updated",0,34,376,398,396);
   m_lbl_updated.Color(CLR_WARNING);
   Add(m_lbl_updated);

   m_settings_card.Create(0,m_name+"SettingsCard",0,18,416,WIDTH-18,558);
   m_settings_card.ColorBackground(CLR_CARD);
   m_settings_card.ColorBorder(CLR_BORDER);
   Add(m_settings_card);

   m_lbl_settings_sec.Create(0,m_name+"SettingsSec",0,34,430,220,452);
   m_lbl_settings_sec.Text("BROADCAST SETTINGS");
   m_lbl_settings_sec.Color(CLR_ACCENT);
   Add(m_lbl_settings_sec);

   m_lbl_symbol_mode.Create(0,m_name+"ModeCap",0,34,460,154,480);
   m_lbl_symbol_mode.Text("Symbol mode");
   m_lbl_symbol_mode.Color(CLR_MUTED);
   Add(m_lbl_symbol_mode);

   m_combo_symbol_mode.Create(0,m_name+"Mode",0,34,484,180,508);
   m_combo_symbol_mode.ItemAdd("Current Chart");
   m_combo_symbol_mode.ItemAdd("Account Primary");
   m_combo_symbol_mode.Select(0);
   Add(m_combo_symbol_mode);

   m_lbl_note.Create(0,m_name+"NoteCap",0,210,460,360,480);
   m_lbl_note.Text("Broadcast note");
   m_lbl_note.Color(CLR_MUTED);
   Add(m_lbl_note);

   m_edt_note.Create(0,m_name+"Note",0,210,484,WIDTH-34,508);
   m_edt_note.Text("Master terminal online");
   m_edt_note.ColorBackground(CLR_CARD_ALT);
   m_edt_note.Color(CLR_TEXT);
   Add(m_edt_note);

   m_status_bar.Create(0,m_name+"Status",0,18,570,WIDTH-18,594);
   m_status_bar.Text("BROADCAST OFF");
   m_status_bar.ReadOnly(true);
   m_status_bar.ColorBackground(CLR_CARD_ALT);
   m_status_bar.Color(CLR_MUTED);
   Add(m_status_bar);

   UpdateSnapshotLabels();
   SetStatus("BROADCAST OFF",CLR_MUTED);
   return true;
}

void MasterCopierUI::UpdateSnapshotLabels(void)
{
   double bid = SymbolInfoDouble(_Symbol,SYMBOL_BID);
   double ask = SymbolInfoDouble(_Symbol,SYMBOL_ASK);
   int digits = (int)SymbolInfoInteger(_Symbol,SYMBOL_DIGITS);
   double spread_points = 0.0;
   if(_Point > 0.0)
      spread_points = (ask - bid) / _Point;

   m_lbl_master_name.Text("Master: " + AccountInfoString(ACCOUNT_NAME));
   m_lbl_account.Text("Login: " + (string)AccountInfoInteger(ACCOUNT_LOGIN));
   m_lbl_balance.Text("Balance: " + DoubleToString(AccountInfoDouble(ACCOUNT_BALANCE),2));
   m_lbl_symbol.Text("Symbol: " + _Symbol);
   m_lbl_price.Text("Bid/Ask: " + DoubleToString(bid,digits) + " / " + DoubleToString(ask,digits) + "  |  Spr: " + DoubleToString(spread_points,1));
   m_lbl_updated.Text("Updated: " + TimeToString(TimeCurrent(),TIME_DATE|TIME_MINUTES|TIME_SECONDS));
}

void MasterCopierUI::SetStatus(const string text,const color text_color)
{
   m_status_bar.Text(text);
   m_status_bar.Color(text_color);
   m_lbl_status_chip.Color(text_color);
}

bool MasterCopierUI::PublishSnapshot(const string status_text)
{
   if(StringLen(m_channel_name) == 0)
      return false;

   FolderCreate(BRIDGE_FOLDER,FILE_COMMON);
   int handle = FileOpen(SnapshotFileName(),FILE_WRITE|FILE_CSV|FILE_COMMON|FILE_ANSI,';');
   if(handle == INVALID_HANDLE)
      return false;

   double bid = SymbolInfoDouble(_Symbol,SYMBOL_BID);
   double ask = SymbolInfoDouble(_Symbol,SYMBOL_ASK);
   double spread_points = 0.0;
   if(_Point > 0.0)
      spread_points = (ask - bid) / _Point;

   FileWrite(handle,"role","master");
   FileWrite(handle,"status",status_text);
   FileWrite(handle,"channel",m_channel_name);
   FileWrite(handle,"master_name",AccountInfoString(ACCOUNT_NAME));
   FileWrite(handle,"platform","MT5");
   FileWrite(handle,"login",(string)AccountInfoInteger(ACCOUNT_LOGIN));
   FileWrite(handle,"symbol",_Symbol);
   FileWrite(handle,"balance",DoubleToString(AccountInfoDouble(ACCOUNT_BALANCE),2));
   FileWrite(handle,"equity",DoubleToString(AccountInfoDouble(ACCOUNT_EQUITY),2));
   FileWrite(handle,"free_margin",DoubleToString(AccountInfoDouble(ACCOUNT_MARGIN_FREE),2));
   FileWrite(handle,"bid",DoubleToString(bid,(int)SymbolInfoInteger(_Symbol,SYMBOL_DIGITS)));
   FileWrite(handle,"ask",DoubleToString(ask,(int)SymbolInfoInteger(_Symbol,SYMBOL_DIGITS)));
   FileWrite(handle,"spread_points",DoubleToString(spread_points,1));
   FileWrite(handle,"symbol_mode",m_combo_symbol_mode.Select());
   FileWrite(handle,"note",m_edt_note.Text());
   FileWrite(handle,"updated",TimeToString(TimeCurrent(),TIME_DATE|TIME_MINUTES|TIME_SECONDS));
   FileClose(handle);
   return true;
}

bool MasterCopierUI::StartBroadcast(void)
{
   m_channel_name = SafeChannelName(m_edt_channel.Text());
   if(m_channel_name == "")
   {
      m_lbl_status_chip.Text("INPUT");
      m_lbl_status_hint.Text("Channel name is required before broadcasting");
      SetStatus("ENTER CHANNEL NAME",CLR_WARNING);
      return false;
   }

   UpdateSnapshotLabels();
   if(!PublishSnapshot("ONLINE"))
   {
      m_lbl_status_chip.Text("ERROR");
      m_lbl_status_hint.Text("Snapshot file could not be created");
      SetStatus("FILE WRITE FAILED",CLR_DANGER);
      return false;
   }

   m_lbl_status_chip.Text("LIVE");
   m_lbl_status_hint.Text("Receivers can now read this master feed");
   SetStatus("BROADCAST LIVE",CLR_SUCCESS);
   return true;
}

void MasterCopierUI::StopBroadcast(void)
{
   PublishSnapshot("OFFLINE");
   m_is_active = false;
   m_channel_name = "";
   m_lbl_status_chip.Text("IDLE");
   m_lbl_status_hint.Text("Ready to publish account data");
   SetStatus("BROADCAST OFF",CLR_MUTED);
}

void MasterCopierUI::ToggleStatus(void)
{
   if(!m_is_active)
   {
      if(!StartBroadcast())
         return;

      m_is_active = true;
      m_btn_toggle.Text("STOP CAST");
      m_btn_toggle.ColorBackground(CLR_DANGER);
      return;
   }

   m_btn_toggle.Text("START CAST");
   m_btn_toggle.ColorBackground(CLR_ACCENT);
   StopBroadcast();
}

void MasterCopierUI::RefreshBroadcast(void)
{
   UpdateSnapshotLabels();

   if(!m_is_active)
      return;

   if(!PublishSnapshot("ONLINE"))
   {
      m_lbl_status_chip.Text("ERROR");
      m_lbl_status_hint.Text("Retrying common-folder snapshot write");
      SetStatus("BROADCAST DEGRADED",CLR_WARNING);
      return;
   }

   m_lbl_status_chip.Text("LIVE");
   m_lbl_status_hint.Text("Snapshot refreshed for all linked receivers");
   SetStatus("BROADCAST LIVE",CLR_SUCCESS);
}

bool MasterCopierUI::OnEvent(const int id,const long &lparam,const double &dparam,const string &sparam)
{
   if(id == CHARTEVENT_OBJECT_CLICK && sparam == m_btn_toggle.Name())
   {
      ToggleStatus();
      return true;
   }

   return CAppDialog::OnEvent(id,lparam,dparam,sparam);
}

MasterCopierUI UI;

int OnInit()
{
   if(!UI.Create(0,"Master Broadcaster",0,50,50,50+WIDTH,50+HEIGHT))
      return INIT_FAILED;

   EventSetTimer(2);
   UI.Run();
   return INIT_SUCCEEDED;
}

void OnDeinit(const int reason)
{
   EventKillTimer();
   UI.Destroy(reason);
}

void OnTimer()
{
   UI.RefreshBroadcast();
}

void OnChartEvent(const int id,const long &lparam,const double &dparam,const string &sparam)
{
   UI.ChartEvent(id,lparam,dparam,sparam);
}
