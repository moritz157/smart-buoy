unit SmartBuoyMain;

interface

uses
  Winapi.Windows, Winapi.Messages, System.SysUtils, System.Variants, System.Classes, Vcl.Graphics,
  Vcl.Controls, Vcl.Forms, Vcl.Dialogs, CPortCtl, Vcl.StdCtrls, CPort, StrUtils,
  Vcl.ExtCtrls, Vcl.Menus, LiveView, SDFileTransfer, IdHttp, Vcl.Grids,
  Vcl.ValEdit, IdBaseComponent, IdComponent, IdTCPConnection, IdTCPClient, IdIOHandler, IdIOHandlerSocket, IdIOHandlerStack, IdSSL, IdSSLOpenSSL;

type
  TFSmartBuoyMain = class(TForm)
    ComPort1: TComPort;
    BtnConnect: TButton;
    BtnGetData: TButton;
    Memo1: TMemo;
    ComDataPacket1: TComDataPacket;
    EdtPort: TEdit;
    GBData: TGroupBox;
    GBConnection: TGroupBox;
    Label1: TLabel;
    Lbl_Status: TLabel;
    EdtInterval: TEdit;
    BtnInterval: TButton;
    TmrInterval: TTimer;
    LblTemp: TLabel;
    GBConfig: TGroupBox;
    CBSaveOnSD: TCheckBox;
    GBLocalConfig: TGroupBox;
    CBSaveData: TCheckBox;
    LblPath: TLabel;
    EdtCsvPath: TEdit;
    BtnBrowseSaveData: TButton;
    CBUploadToServer: TCheckBox;
    EdtServerIP: TEdit;
    LblServerIP: TLabel;
    RGLight: TRadioGroup;
    BtnReadSD: TButton;
    MainMenu1: TMainMenu;
    Datei1: TMenuItem;
    Daten1: TMenuItem;
    ber1: TMenuItem;
    ber2: TMenuItem;
    Verbindungtrennen1: TMenuItem;
    Einstellungen1: TMenuItem;
    N1: TMenuItem;
    Arduinokonfigurieren1: TMenuItem;
    LiveView1: TMenuItem;
    Verlauf1: TMenuItem;
    SDKarteauslesen1: TMenuItem;
    Lbl_Password: TLabel;
    Edt_Token: TEdit;
    Button1: TButton;
    VLE_Sensors: TValueListEditor;
    procedure BtnConnectClick(Sender: TObject);
    procedure BtnGetDataClick(Sender: TObject);
    procedure ComPort1RxChar(Sender: TObject; Count: Integer);
    procedure ComPort1RxBuf(Sender: TObject; const Buffer; Count: Integer);
    procedure ComDataPacket1Packet(Sender: TObject; const Str: string);
    procedure ComPort1BeforeOpen(Sender: TObject);
    procedure ComPort1AfterOpen(Sender: TObject);
    procedure ComPort1BeforeClose(Sender: TObject);
    procedure ComPort1AfterClose(Sender: TObject);
    procedure BtnIntervalClick(Sender: TObject);
    procedure TmrIntervalTimer(Sender: TObject);
    procedure BtnBrowseSaveDataClick(Sender: TObject);
    procedure SetConfigurationEnabled(status: Boolean);
    procedure LiveView1Click(Sender: TObject);
    procedure SDKarteauslesen1Click(Sender: TObject);
    procedure ber2Click(Sender: TObject);
    procedure Button1Click(Sender: TObject);
    procedure BtnReadSDClick(Sender: TObject);
    procedure FormDestroy(Sender: TObject);
  private
    { Private-Deklarationen }
  public
    { Public-Deklarationen }
  end;

var
  FSmartBuoyMain: TFSmartBuoyMain;
  lastPacket: Boolean;
  curr_line: String;

implementation

{$R *.dfm}

function getTypeId(typename: string): Integer;
begin
  if(typename='AIR-TEMPERATURE') then begin
    Result:=0;
  end else if(typename='WATER-TEMPERATURE') then begin
    Result:=1;
  end else if(typename='HUMIDITY') then begin
    Result:=2;
  end else if(typename='WINDSPEED') then begin
    Result:=3;
  end else if(typename='PH') then begin
    Result:=4;
  end else
    Result:=-1;
end;

function PostMeasurement(url, token, measurement: string): string;
var
  lHTTP: TIdHTTP;
  lParamList: TStringList;
  ReqJson: TStringStream;
begin
  lParamList := TStringList.Create;
  lParamList.Add('id=1');
  ReqJson := TStringStream.Create('{"token": "'+token+'", "measurements":['+measurement+']}', TEncoding.UTF8);
  //ReqJson := TStringStream.Create('{"token": "e5933dis5z1cswnifot5yab78z"}');

  lHTTP := TIdHTTP.Create;
  try
    try
      lHTTP.Request.ContentType:='application/json';
      Result := lHTTP.Post(url+'/submitMeasurement', ReqJson);
      except
        on E: EIdHTTPProtocolException do begin
          ShowMessage('HTTP request failed'#13 + IntToStr(E.ErrorCode) + ' ' + E.Message);
        end;
        {on E: EIdOpenSSLAPISSLError do
        begin
          ShowMessage('OpenSSL API failure'#13 + E.ClassName + #13'Result Code: ' + IntToStr(E.RetCode) + #13'Error Code: ' + IntToStr(E.ErrorCode));
        end;
        on E: EIdOpenSSLAPICryptoError do
        begin
          ShowMessage('OpenSSL crypto failure'#13 + E.ClassName + #13'Error Code: ' + IntToStr(E.ErrorCode));
        end;
        on E: EIdOpenSSLError do
        begin
          ShowMessage('Unknown OpenSSL error'#13 + E.ClassName + #13 + E.Message);
        end;
        on E: EIdSocketError do begin
          ShowMessage('Socket error'#13 + E.ClassName + #13'Error Code: ' + IntToStr(E.LastError) + ' ' + E.Message);
        end;     }
        on E: Exception do begin
          ShowMessage('Unexpected error'#13 + E.ClassName + #13 + E.Message);
        end;
      end;
  finally
    lHTTP.Free;
    lParamList.Free;
    ReqJson.Free;
  end;
end;

procedure addLineToFile(path, line: String);
var sl: TStringList;
begin
  sl:=TStringList.Create();
  try
    if FileExists(path) then sl.LoadFromFile(path);
    sl.Add(line);
    sl.SaveToFile(path);
  finally
    sl.Free;
  end;
end;

procedure TFSmartBuoyMain.BtnConnectClick(Sender: TObject);
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

procedure TFSmartBuoyMain.BtnIntervalClick(Sender: TObject);
begin
ComPort1.WriteStr('i'#$D#$A);
{
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
}
end;

procedure TFSmartBuoyMain.BtnReadSDClick(Sender: TObject);
begin
ComPort1.WriteStr('logSD'#$D#$A)
end;

procedure TFSmartBuoyMain.Button1Click(Sender: TObject);
begin
PostMeasurement(EdtServerIP.Text, Edt_Token.Text, '{"type":0,"value":44.0815}');
end;

procedure TFSmartBuoyMain.ber2Click(Sender: TObject);
begin
ShowMessage('Smart Buoy Desktop Version: 1.0' + #$D#$A + 'Lizenziert unter der Apache License 2.0' + #$D#$A + 'Copyright ' + char(169) + ' 2018 Moritz Ahrens' + #$D#$A + 'https://moritz157.github.io/smart-buoy');
end;

procedure TFSmartBuoyMain.BtnBrowseSaveDataClick(Sender: TObject);
var
  saveDialog: TSaveDialog;
begin
saveDialog := TSaveDialog.Create(self);
if not (EdtCsvPath.Text = '') then
begin
  saveDialog.FileName := EdtCsvPath.Text;
end;
saveDialog.Filter := 'CSV-Dateien | *.csv';
saveDialog.DefaultExt := 'csv';
if saveDialog.Execute then
  begin
    EdtCsvPath.Text := saveDialog.FileName;
  end;
saveDialog.Free;
end;

procedure TFSmartBuoyMain.BtnGetDataClick(Sender: TObject);
begin
if(ComPort1.Connected=true) then
begin
  if(VLE_Sensors.Strings.Count=0) then
    ComPort1.WriteStr('sensors'+chr(13));
  //LblTemp.Caption:='';
  ComPort1.WriteStr('a'+chr(13));
end;
end;

procedure TFSmartBuoyMain.ComDataPacket1Packet(Sender: TObject; const Str: string);
var
  tmp_list: TStringList;
  i: Integer;
  measurementJson: string;
begin
if(lastPacket) then
begin
  Delete(curr_line, 1, Pos(#$A, curr_line));
end;

if(ContainsText(curr_line+Str, #$D#$A) = true) then
begin
lastPacket:=true;
try
  try
    tmp_list:=TStringList.Create;
    tmp_list.Delimiter:='|';
    tmp_list.DelimitedText:=ReplaceStr(curr_line, ' ', '');
    if(tmp_list[0]='m') then
    begin
      //ShowMessage('Measurement');
      tmp_list.Delimiter:=';';
      tmp_list.DelimitedText:=tmp_list[1];
      measurementJson:='';
      for i := 0 to tmp_list.Count-1 do
      begin
        if(tmp_list[i]<>'') then
        begin
          VLE_Sensors.Strings[i]:=VLE_Sensors.Cells[0, i+1]+'='+tmp_list[i];
          if(getTypeId(VLE_Sensors.Cells[0, i+1])<>-1) AND (tmp_list[i]<>'NAN') then
            measurementJson:=measurementJson+'{"type":'+inttostr(getTypeId(VLE_Sensors.Cells[0, i+1]))+', "value":'+tmp_list[i]+'},';
        end;
      end;
      Delete(measurementJson, Length(measurementJson), 1);
      if(CBUploadToServer.Checked) then
        PostMeasurement(EdtServerIP.Text, Edt_Token.Text, measurementJson);
    end else if(tmp_list[0]='sensors') then
    begin
      tmp_list.Delimiter:=';';
      tmp_list.DelimitedText:=tmp_list[1];
      for i := 0 to tmp_list.Count-1 do
        VLE_Sensors.InsertRow(tmp_list[i], '', true);
      //ShowMessage('Sensors');
    end;
  except
    on E: Exception do begin
      ShowMessage('An unexpected error occured');
    end;
  end;
finally
  tmp_list.Free;
end;
if (CBSaveData.Checked=true) AND (EdtCsvPath.Text<>'') then addLineToFile(EdtCsvPath.Text, Memo1.Lines[Memo1.Lines.Count-1]);
end else lastPacket:=false;
curr_line:=curr_line+Str;
Memo1.Text:=Memo1.Text + Str;
FSDFileTransfer.onPacket(Str);
end;

procedure TFSmartBuoyMain.SDKarteauslesen1Click(Sender: TObject);
begin
FSDFileTransfer.Show;
FSDFileTransfer.ComPort:=ComPort1;
end;

procedure TFSmartBuoyMain.SetConfigurationEnabled(status: Boolean);
begin
  //Disable Configuration
  CBSaveData.Enabled:=status;
  BtnBrowseSaveData.Enabled:=status;
  CBUploadToServer.Enabled:=status;
  EdtServerIP.Enabled:=status;
  EdtCsvPath.Enabled:=status;
end;

procedure TFSmartBuoyMain.ComPort1AfterClose(Sender: TObject);
begin
Lbl_Status.Caption:='Getrennt';
BtnConnect.Enabled:=true;
BtnConnect.Caption:='Verbinden';
EdtPort.Enabled:=true;
LiveViewForm.setConnectionStatus(Lbl_Status.Caption);
SetConfigurationEnabled(true);
end;

procedure TFSmartBuoyMain.ComPort1AfterOpen(Sender: TObject);
begin
Lbl_Status.Caption:='Verbunden';
BtnConnect.Enabled:=true;
BtnConnect.Caption:='Trennen';
LiveViewForm.setConnectionStatus(Lbl_Status.Caption);
SetConfigurationEnabled(false);
end;

procedure TFSmartBuoyMain.ComPort1BeforeClose(Sender: TObject);
begin
Lbl_Status.Caption:='Trennen';
BtnConnect.Enabled:=false;
LiveViewForm.setConnectionStatus(Lbl_Status.Caption);
end;

procedure TFSmartBuoyMain.ComPort1BeforeOpen(Sender: TObject);
begin
Lbl_Status.Caption:='Verbinden...';
BtnConnect.Enabled:=false;
EdtPort.Enabled:=false;
LiveViewForm.setConnectionStatus(Lbl_Status.Caption);
end;

procedure TFSmartBuoyMain.ComPort1RxBuf(Sender: TObject; const Buffer; Count: Integer);
var
s: String;
begin
s:='';
ComPort1.ReadStr(s, 10);
//Memo1.Text:=IntToStr(Count);
end;

procedure TFSmartBuoyMain.ComPort1RxChar(Sender: TObject; Count: Integer);
var
s: String;
begin
ComPort1.ReadStr(s, Count);
ShowMessage(s);
end;

procedure TFSmartBuoyMain.FormDestroy(Sender: TObject);
begin
ComPort1.Free;
ComDataPacket1.Free;
end;

procedure TFSmartBuoyMain.LiveView1Click(Sender: TObject);
begin
LiveViewForm.Show;
end;

procedure TFSmartBuoyMain.TmrIntervalTimer(Sender: TObject);
begin
if(ComPort1.Connected=true) then
begin
  //LblTemp.Caption:='';
  ComPort1.WriteStr('a');
end;
end;
end.
