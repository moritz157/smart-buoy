unit SmartBuoyMain;

interface

uses
  Winapi.Windows, Winapi.Messages, System.SysUtils, System.Variants, System.Classes, Vcl.Graphics,
  Vcl.Controls, Vcl.Forms, Vcl.Dialogs, CPortCtl, Vcl.StdCtrls, CPort, StrUtils,
  Vcl.ExtCtrls;

type
  TForm6 = class(TForm)
    ComPort1: TComPort;
    BtnConnect: TButton;
    Button2: TButton;
    Memo1: TMemo;
    ComDataPacket1: TComDataPacket;
    EdtPort: TEdit;
    GroupBox1: TGroupBox;
    GroupBox2: TGroupBox;
    Label1: TLabel;
    Lbl_Status: TLabel;
    Label2: TLabel;
    EdtInterval: TEdit;
    BtnInterval: TButton;
    TmrInterval: TTimer;
    LblTemp: TLabel;
    procedure BtnConnectClick(Sender: TObject);
    procedure Button2Click(Sender: TObject);
    procedure ComPort1RxChar(Sender: TObject; Count: Integer);
    procedure ComPort1RxBuf(Sender: TObject; const Buffer; Count: Integer);
    procedure ComDataPacket1Packet(Sender: TObject; const Str: string);
    procedure ComPort1BeforeOpen(Sender: TObject);
    procedure ComPort1AfterOpen(Sender: TObject);
    procedure ComPort1BeforeClose(Sender: TObject);
    procedure ComPort1AfterClose(Sender: TObject);
    procedure BtnIntervalClick(Sender: TObject);
    procedure TmrIntervalTimer(Sender: TObject);
  private
    { Private-Deklarationen }
  public
    { Public-Deklarationen }
  end;

var
  Form6: TForm6;
  lastPacket: Boolean;

implementation

{$R *.dfm}

procedure TForm6.BtnConnectClick(Sender: TObject);
begin
if(ComPort1.Connected) then
begin
  ComPort1.Close();
end else if not(EdtPort.Text='') then
begin
  ComPort1.Port:=EdtPort.Text;
  ComPort1.Open();

end;
end;

procedure TForm6.BtnIntervalClick(Sender: TObject);
begin
if TmrInterval.Enabled=true then
begin
  BtnInterval.Caption:='Interval starten';
  TmrInterval.Enabled:=false;
  EdtInterval.Enabled:=true;
end
else if not(EdtInterval.Text = '') then
begin
  TmrInterval.Interval := StrToInt(EdtInterval.Text)*1000;
  TmrInterval.Enabled:=true;
  BtnInterval.Caption:='Interval stoppen';
  EdtInterval.Enabled:=false;
end;
end;

procedure TForm6.Button2Click(Sender: TObject);
begin
if(ComPort1.Connected=true) then
begin
  //LblTemp.Caption:='';
  ComPort1.WriteStr('a');
end;
end;

procedure TForm6.ComDataPacket1Packet(Sender: TObject; const Str: string);
begin
if(lastPacket) then LblTemp.Caption:='';
if(ContainsText(Str, #$D#$A) = true) then begin
lastPacket:=true;
end else lastPacket:=false;
LblTemp.Caption:=LblTemp.Caption+Str;
Memo1.Text:=Memo1.Text + Str;
end;

procedure TForm6.ComPort1AfterClose(Sender: TObject);
begin
Lbl_Status.Caption:='Getrennt';
BtnConnect.Enabled:=true;
BtnConnect.Caption:='Verbinden';
EdtPort.Enabled:=true;
end;

procedure TForm6.ComPort1AfterOpen(Sender: TObject);
begin
Lbl_Status.Caption:='Verbunden';
BtnConnect.Enabled:=true;
BtnConnect.Caption:='Trennen';
end;

procedure TForm6.ComPort1BeforeClose(Sender: TObject);
begin
Lbl_Status.Caption:='Trennen';
BtnConnect.Enabled:=false;
end;

procedure TForm6.ComPort1BeforeOpen(Sender: TObject);
begin
Lbl_Status.Caption:='Verbinden...';
BtnConnect.Enabled:=false;
EdtPort.Enabled:=false;
end;

procedure TForm6.ComPort1RxBuf(Sender: TObject; const Buffer; Count: Integer);
var
s: String;
begin
s:='';
ComPort1.ReadStr(s, 10);
//Memo1.Text:=IntToStr(Count);
end;

procedure TForm6.ComPort1RxChar(Sender: TObject; Count: Integer);
var
s: String;
begin
ComPort1.ReadStr(s, Count);
ShowMessage(s);
end;

procedure TForm6.TmrIntervalTimer(Sender: TObject);
begin
if(ComPort1.Connected=true) then
begin
  //LblTemp.Caption:='';
  ComPort1.WriteStr('a');
end;
end;

end.