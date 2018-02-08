unit SDFileTransfer;

interface

uses
  Winapi.Windows, Winapi.Messages, System.SysUtils, System.Variants, System.Classes, Vcl.Graphics,
  Vcl.Controls, Vcl.Forms, Vcl.Dialogs, Vcl.StdCtrls, Vcl.ComCtrls, StrUtils, CPort,
  Vcl.Grids, Vcl.DBGrids;

type
  TFSDFileTransfer = class(TForm)
    BtnStartTransmission: TButton;
    PBTransmission: TProgressBar;
    LblStatus: TLabel;
    GRData: TStringGrid;
    BtnSaveAsCsv: TButton;
    procedure onPacket(const Str: String);
    procedure BtnStartTransmissionClick(Sender: TObject);
    procedure FormCreate(Sender: TObject);
    procedure FormDestroy(Sender: TObject);
    procedure BtnSaveAsCsvClick(Sender: TObject);
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
  line := line + Str;
  while(Pos(#$D#$A, line)<>0) do
  begin
    buffer.Add(Copy(line, 1, Pos(#$D#$A, line)-1));
    Delete(line, 1, Pos(#$D#$A, line)+1);
  end;
  //buffer.DelimitedText := buffer.DelimitedText + StringReplace(Str, #$A#$D, '|', [rfReplaceAll]);
  //Memo1.Lines.Delimiter:='|';
  //Memo1.Lines.DelimitedText:=buffer.DelimitedText;
  if(buffer.Count<2) then Exit;
  if(buffer.Strings[buffer.Count-2]='--HEADERS--') then
  begin
    state:=0;
    LblStatus.Caption:='Status: Headers';
  end else if(buffer.Strings[buffer.Count-2]='--BODY--') then
  begin
    state:=1;
    LblStatus.Caption:='Status: Body';
  end else if(buffer.Strings[buffer.Count-1]='---TRANSMISSION-END---') then
  begin
    state:=-1;
    ShowMessage('‹bertragung abgeschlossen');
    BtnSaveAsCsv.Enabled:=true;
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
          GRData.FixedRows:=1;
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

procedure TFSDFileTransfer.BtnSaveAsCsvClick(Sender: TObject);
var
  saveDialog: TSaveDialog;
  fileContent: TStringList;
begin
  saveDialog := TSaveDialog.Create(self);
  saveDialog.FileName := 'SMART-BUOY-' + Copy(headers[0], 9) + '-DATA.csv';
  saveDialog.Filter := 'CSV-Datei | *.csv';
  saveDialog.DefaultExt := 'csv';
  saveDialog.Title:='Speichern unter';
  if saveDialog.Execute then
  begin
    ShowMessage('Speichern mit Pfad: '+saveDialog.FileName);
    fileContent:=TStringList.Create;
    fileContent.Add(headers[2]);
    fileContent.AddStrings(body);
    fileContent.SaveToFile(saveDialog.FileName);
    fileContent.Free;
    saveDialog.Free;
    ShowMessage('CSV-Datei gespeichert.');
  end;

end;

procedure TFSDFileTransfer.BtnStartTransmissionClick(Sender: TObject);
begin
  if(ComPort.Connected=true) then
  begin
    line:='';
    buffer.Text:='';
    lastCount:=0;
    headers.Clear;
    body.Clear;
    PBTransmission.Position:=0;
    GRData.ColCount:=1;
    GRData.RowCount:=1;
    BtnSaveAsCsv.Enabled:=false;
    ComPort.WriteStr('logSD'+chr(13));
  end;
end;

procedure TFSDFileTransfer.FormCreate(Sender: TObject);
begin
  state:=-1;
  headers:=TStringList.Create;
  body:=TStringList.Create;
  buffer:=TStringList.Create;
  buffer.Delimiter:='|';
end;
procedure TFSDFileTransfer.FormDestroy(Sender: TObject);
begin
  headers.Free;
  body.Free;
  buffer.Free;
end;

end.
