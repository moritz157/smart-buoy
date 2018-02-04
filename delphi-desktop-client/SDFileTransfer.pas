unit SDFileTransfer;

interface

uses
  Winapi.Windows, Winapi.Messages, System.SysUtils, System.Variants, System.Classes, Vcl.Graphics,
  Vcl.Controls, Vcl.Forms, Vcl.Dialogs, Vcl.StdCtrls, Vcl.ComCtrls, StrUtils, CPort,
  Vcl.Grids, Vcl.DBGrids;

type
  TFSDFileTransfer = class(TForm)
    Button1: TButton;
    PBTransmission: TProgressBar;
    Memo1: TMemo;
    Label1: TLabel;
    GRData: TStringGrid;
    procedure onPacket(const Str: String);
    procedure Button1Click(Sender: TObject);
    procedure FormCreate(Sender: TObject);
    procedure FormDestroy(Sender: TObject);
  private
    { Private-Deklarationen }
    line: String;
    headers, body, buffer: TStrings;
    state, lastCount: Integer;
  public
    { Public-Deklarationen }
    ComPort: TComPort;
  end;

var
  FSDFileTransfer: TFSDFileTransfer;

implementation

procedure TFSDFileTransfer.onPacket(const Str: String);
var
  colNames: TStringList;
  i: Integer;
begin
  buffer.Text := buffer.Text + StringReplace(Str, #$A, '', [rfReplaceAll]);
  if(buffer.Count<2) then Exit;
  if(buffer.Strings[buffer.Count-2]='--HEADERS--') then
  begin
    state:=0;
  end else if(buffer.Strings[buffer.Count-2]='--BODY--') then
  begin
    state:=1;
  end else if(buffer.Strings[buffer.Count-1]='---TRANSMISSION-END---') then
  begin
    state:=-1;
    ShowMessage('Übertragung abgeschlossen');
    //ShowMessage(headers.Text);
    //ShowMessage(body[body.Count-1]);
  end else begin
    if(buffer.Count>lastCount) then
    begin
      lastCount:=buffer.Count;
      case state of
        0: headers.Add(buffer.Strings[buffer.Count-2]);
        1: begin
          body.Add(buffer.Strings[buffer.Count-2]);
          PBTransmission.Position:=PBTransmission.Position+Length(buffer.Strings[buffer.Count-2])+3;
          GRData.RowCount:=GRData.RowCount+1;
          GRData.Rows[GRData.RowCount-1].Delimiter:=';';
          GRData.Rows[GRData.RowCount-1].DelimitedText:=buffer.Strings[buffer.Count-2];
        end;
      end;

      if(headers.Count=2) then
      begin
        PBTransmission.Max:= StrToInt(Copy(headers[1], 6));
      end;
      if(headers.Count=3) AND (GRData.ColCount=1) then
      begin
        colNames:=TStringList.Create;
        colNames.Delimiter:=';';
        colNames.DelimitedText:=headers[2];
        GRData.ColCount:=colNames.Count;
        for i := 0 to colNames.Count-1 do
        begin
          GRData.Cols[i].Text:=colNames[i];
        end;
        colNames.Free;
      end;
    end;
  end;
end;

{$R *.dfm}

procedure TFSDFileTransfer.Button1Click(Sender: TObject);
begin
  if(ComPort.Connected=true) then
  begin
    buffer.Text:='';
    lastCount:=0;
    headers.Clear;
    body.Clear;
    PBTransmission.Position:=0;
    ComPort.WriteStr('logSD'+chr(13));
  end;
end;

procedure TFSDFileTransfer.FormCreate(Sender: TObject);
begin
  state:=-1;
  headers:=TStringList.Create;
  body:=TStringList.Create;
  buffer:=TStringList.Create;
  buffer.Delimiter:=chr(13);
end;
procedure TFSDFileTransfer.FormDestroy(Sender: TObject);
begin
  headers.Free;
  body.Free;
  buffer.Free;
end;

end.
