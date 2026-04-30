//+------------------------------------------------------------------+
//|                                           TradeReceiverModern.mq5|
//|                                Copyright 2026, Trading AI Corp   |
//+------------------------------------------------------------------+
#property copyright "Copyright 2026"
#property version   "9.00"
#property strict

#include <Controls\Dialog.mqh>
#include <Controls\Button.mqh>
#include <Controls\Edit.mqh>
#include <Controls\CheckBox.mqh>
#include <Controls\Label.mqh>
#include <Controls\ComboBox.mqh>
#include <Controls\Panel.mqh>

#define CLR_MAIN_BG       C'11,16,24'
#define CLR_SHELL         C'18,27,38'
#define CLR_CARD          C'23,35,49'
#define CLR_CARD_ALT      C'29,43,60'
#define CLR_ACCENT        C'0,198,255'
#define CLR_ACCENT_SOFT   C'49,113,140'
#define CLR_SUCCESS       C'32,201,151'
#define CLR_WARNING       C'255,184,77'
#define CLR_DANGER        C'232,76,61'
#define CLR_TEXT          C'239,245,250'
#define CLR_MUTED         C'145,164,180'
#define CLR_BORDER        C'55,76,97'

#define WIDTH             440
#define HEIGHT            670
#define BRIDGE_FOLDER     "TradeBridge"

class TradeReceiverUI : public CAppDialog
{
private:
   CPanel      m_shell_panel;
   CPanel      m_header_panel;
   CPanel      m_channel_card;
   CPanel      m_master_card;
   CPanel      m_config_card;
   CPanel      m_filter_card;

   CLabel      m_lbl_brand;
   CLabel      m_lbl_subtitle;
   CLabel      m_lbl_status_chip;
   CLabel      m_lbl_status_hint;

   CButton     m_btn_toggle;
   CEdit       m_status_bar;

   CLabel      m_lbl_conn_sec;
   CLabel      m_lbl_channel_hint;
   CEdit       m_edt_channel;

   CLabel      m_lbl_master_sec;
   CLabel      m_lbl_master_name;
   CLabel      m_lbl_master_platform;
   CLabel      m_lbl_master_symbol;
   CLabel      m_lbl_master_balance;
   CLabel      m_lbl_master_updated;

   CLabel      m_lbl_price_sec;
   CLabel      m_lbl_slip_caption;
   CEdit       m_edt_slip;
   CLabel      m_lbl_type_caption;
   CComboBox   m_combo_type;

   CLabel      m_lbl_filter_sec;
   CLabel      m_lbl_filter_hint;
   CCheckBox   m_chk_buy;
   CCheckBox   m_chk_sell;
   CCheckBox   m_chk_pend;

   CLabel      m_lbl_footer;

   bool        m_is_active;
   string      m_channel_name;
   datetime    m_last_sync;

public:
               TradeReceiverUI(void) : m_is_active(false), m_channel_name(""), m_last_sync(0) {}
   virtual bool Create(const long chart,const string name,const int subwin,const int x1,const int y1,const int x2,const int y2);
   virtual bool OnEvent(const int id,const long &lparam,const double &dparam,const string &sparam);

   void        RefreshConnection(void);

protected:
   void        ToggleStatus(void);
   bool        ConnectToChannel(void);
   void        DisconnectChannel(void);
   bool        LoadMasterSnapshot(void);
   bool        PublishReceiverConfig(void);
   string      SnapshotFileName(void) const;
   string      ReceiverFileName(void) const;
   string      SafeChannelName(const string channel_text) const;
   void        SetStatus(const string text,const color text_color);
   void        SetMasterInfo(const string master_name,
                            const string platform,
                            const string symbol,
                            const string balance,
                            const string updated);
};

string TradeReceiverUI::SafeChannelName(const string channel_text) const
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

string TradeReceiverUI::SnapshotFileName(void) const
{
   return BRIDGE_FOLDER + "\\" + SafeChannelName(m_edt_channel.Text()) + "_master.csv";
}

string TradeReceiverUI::ReceiverFileName(void) const
{
   return BRIDGE_FOLDER + "\\" + SafeChannelName(m_edt_channel.Text()) + "_receiver.csv";
}

bool TradeReceiverUI::Create(const long chart,const string name,const int subwin,const int x1,const int y1,const int x2,const int y2)
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

   m_lbl_brand.Create(0,m_name+"Brand",0,34,30,280,54);
   m_lbl_brand.Text("LOCAL TRADE COPIER");
   m_lbl_brand.Color(CLR_TEXT);
   Add(m_lbl_brand);

   m_lbl_subtitle.Create(0,m_name+"Sub",0,34,55,290,76);
   m_lbl_subtitle.Text("Receiver dashboard for MT5 signal mirror");
   m_lbl_subtitle.Color(CLR_MUTED);
   Add(m_lbl_subtitle);

   m_lbl_status_chip.Create(0,m_name+"Chip",0,292,32,402,56);
   m_lbl_status_chip.Text("OFFLINE");
   m_lbl_status_chip.Color(CLR_WARNING);
   Add(m_lbl_status_chip);

   m_btn_toggle.Create(0,m_name+"Btn",0,34,88,188,122);
   m_btn_toggle.Text("START LINK");
   m_btn_toggle.ColorBackground(CLR_ACCENT);
   m_btn_toggle.Color(CLR_TEXT);
   Add(m_btn_toggle);

   m_lbl_status_hint.Create(0,m_name+"Hint",0,206,92,404,118);
   m_lbl_status_hint.Text("Waiting for a master channel");
   m_lbl_status_hint.Color(CLR_MUTED);
   Add(m_lbl_status_hint);

   m_channel_card.Create(0,m_name+"ChannelCard",0,18,154,WIDTH-18,244);
   m_channel_card.ColorBackground(CLR_CARD);
   m_channel_card.ColorBorder(CLR_BORDER);
   Add(m_channel_card);

   m_lbl_conn_sec.Create(0,m_name+"ConnSec",0,34,168,220,190);
   m_lbl_conn_sec.Text("CHANNEL CONNECT");
   m_lbl_conn_sec.Color(CLR_ACCENT);
   Add(m_lbl_conn_sec);

   m_lbl_channel_hint.Create(0,m_name+"ChannelHint",0,34,192,398,212);
   m_lbl_channel_hint.Text("Use the same room name as the master broadcaster");
   m_lbl_channel_hint.Color(CLR_MUTED);
   Add(m_lbl_channel_hint);

   m_edt_channel.Create(0,m_name+"Channel",0,34,214,WIDTH-34,238);
   m_edt_channel.Text("MASTER-01");
   m_edt_channel.ColorBackground(CLR_CARD_ALT);
   m_edt_channel.Color(CLR_TEXT);
   Add(m_edt_channel);

   m_master_card.Create(0,m_name+"MasterCard",0,18,256,WIDTH-18,390);
   m_master_card.ColorBackground(CLR_CARD);
   m_master_card.ColorBorder(CLR_BORDER);
   Add(m_master_card);

   m_lbl_master_sec.Create(0,m_name+"MasterSec",0,34,270,220,292);
   m_lbl_master_sec.Text("MASTER SNAPSHOT");
   m_lbl_master_sec.Color(CLR_SUCCESS);
   Add(m_lbl_master_sec);

   m_lbl_master_name.Create(0,m_name+"MasterName",0,34,300,398,320);
   m_lbl_master_name.Color(CLR_TEXT);
   Add(m_lbl_master_name);

   m_lbl_master_platform.Create(0,m_name+"MasterPlatform",0,34,324,398,344);
   m_lbl_master_platform.Color(CLR_MUTED);
   Add(m_lbl_master_platform);

   m_lbl_master_symbol.Create(0,m_name+"MasterSymbol",0,34,348,398,368);
   m_lbl_master_symbol.Color(CLR_MUTED);
   Add(m_lbl_master_symbol);

   m_lbl_master_balance.Create(0,m_name+"MasterBalance",0,220,324,398,344);
   m_lbl_master_balance.Color(CLR_MUTED);
   Add(m_lbl_master_balance);

   m_lbl_master_updated.Create(0,m_name+"MasterUpdated",0,220,348,398,368);
   m_lbl_master_updated.Color(CLR_WARNING);
   Add(m_lbl_master_updated);

   m_config_card.Create(0,m_name+"ConfigCard",0,18,402,WIDTH-18,508);
   m_config_card.ColorBackground(CLR_CARD);
   m_config_card.ColorBorder(CLR_BORDER);
   Add(m_config_card);

   m_lbl_price_sec.Create(0,m_name+"PriceSec",0,34,416,220,438);
   m_lbl_price_sec.Text("EXECUTION PROFILE");
   m_lbl_price_sec.Color(CLR_ACCENT);
   Add(m_lbl_price_sec);

   m_lbl_slip_caption.Create(0,m_name+"SlipCap",0,34,444,154,464);
   m_lbl_slip_caption.Text("Slippage");
   m_lbl_slip_caption.Color(CLR_MUTED);
   Add(m_lbl_slip_caption);

   m_edt_slip.Create(0,m_name+"Slip",0,34,468,160,492);
   m_edt_slip.Text("0.5");
   m_edt_slip.ColorBackground(CLR_CARD_ALT);
   m_edt_slip.Color(CLR_TEXT);
   Add(m_edt_slip);

   m_lbl_type_caption.Create(0,m_name+"TypeCap",0,190,444,330,464);
   m_lbl_type_caption.Text("Slip mode");
   m_lbl_type_caption.Color(CLR_MUTED);
   Add(m_lbl_type_caption);

   m_combo_type.Create(0,m_name+"Type",0,190,468,WIDTH-34,492);
   m_combo_type.ItemAdd("Percentage");
   m_combo_type.ItemAdd("Pips");
   m_combo_type.Select(0);
   Add(m_combo_type);

   m_filter_card.Create(0,m_name+"FilterCard",0,18,520,WIDTH-18,620);
   m_filter_card.ColorBackground(CLR_CARD);
   m_filter_card.ColorBorder(CLR_BORDER);
   Add(m_filter_card);

   m_lbl_filter_sec.Create(0,m_name+"FilterSec",0,34,534,220,556);
   m_lbl_filter_sec.Text("ORDER FILTERS");
   m_lbl_filter_sec.Color(CLR_ACCENT);
   Add(m_lbl_filter_sec);

   m_lbl_filter_hint.Create(0,m_name+"FilterHint",0,34,558,398,578);
   m_lbl_filter_hint.Text("Choose which trade types can be copied");
   m_lbl_filter_hint.Color(CLR_MUTED);
   Add(m_lbl_filter_hint);

   m_chk_buy.Create(0,m_name+"ChkBuy",0,34,588,130,608);
   m_chk_buy.Text("BUY");
   m_chk_buy.Color(CLR_TEXT);
   m_chk_buy.Checked(true);
   Add(m_chk_buy);

   m_chk_sell.Create(0,m_name+"ChkSell",0,152,588,248,608);
   m_chk_sell.Text("SELL");
   m_chk_sell.Color(CLR_TEXT);
   m_chk_sell.Checked(true);
   Add(m_chk_sell);

   m_chk_pend.Create(0,m_name+"ChkPend",0,270,588,392,608);
   m_chk_pend.Text("PENDING");
   m_chk_pend.Color(CLR_TEXT);
   m_chk_pend.Checked(true);
   Add(m_chk_pend);

   m_status_bar.Create(0,m_name+"Status",0,18,632,WIDTH-18,656);
   m_status_bar.Text("DISCONNECTED");
   m_status_bar.ReadOnly(true);
   m_status_bar.ColorBackground(CLR_CARD_ALT);
   m_status_bar.Color(CLR_MUTED);
   Add(m_status_bar);

   m_lbl_footer.Create(0,m_name+"Footer",0,34,640,398,658);
   m_lbl_footer.Text("Keep this receiver chart open while the master is live");
   m_lbl_footer.Color(CLR_MUTED);
   Add(m_lbl_footer);

   SetMasterInfo("-","-","-","-","-");
   SetStatus("DISCONNECTED",CLR_MUTED);
   return true;
}

void TradeReceiverUI::SetStatus(const string text,const color text_color)
{
   m_status_bar.Text(text);
   m_status_bar.Color(text_color);
   m_lbl_status_chip.Color(text_color);
}

void TradeReceiverUI::SetMasterInfo(const string master_name,
                                    const string platform,
                                    const string symbol,
                                    const string balance,
                                    const string updated)
{
   m_lbl_master_name.Text("Master: " + master_name);
   m_lbl_master_platform.Text("Platform: " + platform);
   m_lbl_master_symbol.Text("Symbol: " + symbol);
   m_lbl_master_balance.Text("Balance: " + balance);
   m_lbl_master_updated.Text("Last Sync: " + updated);
}

bool TradeReceiverUI::LoadMasterSnapshot(void)
{
   string file_name = SnapshotFileName();
   int handle = FileOpen(file_name,FILE_READ|FILE_CSV|FILE_COMMON|FILE_ANSI,';');
   if(handle == INVALID_HANDLE)
      return false;

   string master_name = "-";
   string platform    = "-";
   string symbol      = "-";
   string balance     = "-";
   string updated     = "-";
   string master_state = "";

   while(!FileIsEnding(handle))
   {
      string key = FileReadString(handle);
      if(FileIsEnding(handle) && key == "")
         break;

      string value = FileReadString(handle);
      if(key == "master_name")
         master_name = value;
      else if(key == "platform")
         platform = value;
      else if(key == "symbol")
         symbol = value;
      else if(key == "balance")
         balance = value;
      else if(key == "updated")
         updated = value;
      else if(key == "status")
         master_state = value;
   }

   FileClose(handle);

   if(master_state == "OFFLINE")
      return false;

   SetMasterInfo(master_name,platform,symbol,balance,updated);
   m_last_sync = TimeCurrent();
   return true;
}

bool TradeReceiverUI::PublishReceiverConfig(void)
{
   if(StringLen(m_channel_name) == 0)
      return false;

   FolderCreate(BRIDGE_FOLDER,FILE_COMMON);
   int handle = FileOpen(ReceiverFileName(),FILE_WRITE|FILE_CSV|FILE_COMMON|FILE_ANSI,';');
   if(handle == INVALID_HANDLE)
      return false;

   FileWrite(handle,"role","receiver");
   FileWrite(handle,"status",m_is_active ? "ACTIVE" : "IDLE");
   FileWrite(handle,"channel",m_channel_name);
   FileWrite(handle,"receiver_login",(string)AccountInfoInteger(ACCOUNT_LOGIN));
   FileWrite(handle,"receiver_name",AccountInfoString(ACCOUNT_NAME));
   FileWrite(handle,"symbol",_Symbol);
   FileWrite(handle,"slippage_value",m_edt_slip.Text());
   FileWrite(handle,"slippage_mode",m_combo_type.Select());
   FileWrite(handle,"allow_buy",m_chk_buy.Checked() ? "true" : "false");
   FileWrite(handle,"allow_sell",m_chk_sell.Checked() ? "true" : "false");
   FileWrite(handle,"allow_pending",m_chk_pend.Checked() ? "true" : "false");
   FileWrite(handle,"updated",TimeToString(TimeCurrent(),TIME_DATE|TIME_MINUTES|TIME_SECONDS));
   FileClose(handle);
   return true;
}

bool TradeReceiverUI::ConnectToChannel(void)
{
   m_channel_name = SafeChannelName(m_edt_channel.Text());
   if(m_channel_name == "")
   {
      m_lbl_status_chip.Text("INPUT");
      m_lbl_status_hint.Text("Channel name is required before linking");
      SetStatus("ENTER CHANNEL NAME",CLR_WARNING);
      return false;
   }

   if(!LoadMasterSnapshot())
   {
      m_lbl_status_chip.Text("SEARCH");
      m_lbl_status_hint.Text("No active master found on this channel yet");
      SetStatus("MASTER NOT FOUND",CLR_WARNING);
      SetMasterInfo("-","-","-","-","Waiting for channel data");
      PublishReceiverConfig();
      return false;
   }

   PublishReceiverConfig();
   m_lbl_status_chip.Text("LIVE");
   m_lbl_status_hint.Text("Receiver is paired and ready to mirror trades");
   SetStatus("CONNECTED TO MASTER",CLR_SUCCESS);
   return true;
}

void TradeReceiverUI::DisconnectChannel(void)
{
   m_is_active = false;
   PublishReceiverConfig();
   m_channel_name = "";
   m_lbl_status_chip.Text("OFFLINE");
   m_lbl_status_hint.Text("Waiting for a master channel");
   SetStatus("DISCONNECTED",CLR_MUTED);
   SetMasterInfo("-","-","-","-","-");
}

void TradeReceiverUI::ToggleStatus(void)
{
   if(!m_is_active)
   {
      if(!ConnectToChannel())
         return;

      m_is_active = true;
      PublishReceiverConfig();
      m_btn_toggle.Text("STOP LINK");
      m_btn_toggle.ColorBackground(CLR_DANGER);
      return;
   }

   m_btn_toggle.Text("START LINK");
   m_btn_toggle.ColorBackground(CLR_ACCENT);
   DisconnectChannel();
}

void TradeReceiverUI::RefreshConnection(void)
{
   if(!m_is_active)
      return;

   if(!LoadMasterSnapshot())
   {
      m_lbl_status_chip.Text("WAIT");
      m_lbl_status_hint.Text("Master data paused, still listening on channel");
      SetStatus("WAITING FOR MASTER...",CLR_WARNING);
      PublishReceiverConfig();
      return;
   }

   PublishReceiverConfig();
   m_lbl_status_chip.Text("LIVE");
   m_lbl_status_hint.Text("Channel synced successfully");
   SetStatus("SYSTEM ACTIVE",CLR_SUCCESS);
}

bool TradeReceiverUI::OnEvent(const int id,const long &lparam,const double &dparam,const string &sparam)
{
   if(id == CHARTEVENT_OBJECT_CLICK && sparam == m_btn_toggle.Name())
   {
      ToggleStatus();
      return true;
   }

   return CAppDialog::OnEvent(id,lparam,dparam,sparam);
}

TradeReceiverUI UI;

int OnInit()
{
   if(!UI.Create(0,"Trade Receiver",0,50,50,50+WIDTH,50+HEIGHT))
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
   UI.RefreshConnection();
}

void OnChartEvent(const int id,const long &lparam,const double &dparam,const string &sparam)
{
   UI.ChartEvent(id,lparam,dparam,sparam);
}
