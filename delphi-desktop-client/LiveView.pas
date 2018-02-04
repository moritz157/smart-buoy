unit LiveView;

interface

uses
  Winapi.Windows, Winapi.Messages, System.SysUtils, System.Variants, System.Classes, Vcl.Graphics,
  Vcl.Controls, Vcl.Forms, Vcl.Dialogs, Vcl.StdCtrls;

type
  TLiveViewForm = class(TForm)
    LblConnectedWith: TLabel;
    procedure FormCreate(Sender: TObject);
    procedure setConnectionStatus(status: String);
  private
    { Private-Deklarationen }
  public

    { Public-Deklarationen }
  end;

var
  LiveViewForm: TLiveViewForm;

implementation

{$R *.dfm}

procedure TLiveViewForm.setConnectionStatus(status: String);
begin
  LblConnectedWith.Caption:='Verbindung: '+status;
end;

procedure TLiveViewForm.FormCreate(Sender: TObject);
begin
setConnectionStatus('Getrennt');
end;

end.
