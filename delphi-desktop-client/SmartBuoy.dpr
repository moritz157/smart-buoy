program SmartBuoy;

uses
  Vcl.Forms,
  SmartBuoyMain in 'SmartBuoyMain.pas' {Form6},
  LiveView in 'LiveView.pas' {LiveViewForm},
  SDFileTransfer in 'SDFileTransfer.pas' {FSDFileTransfer};

{$R *.res}

begin
  Application.Initialize;
  Application.MainFormOnTaskbar := True;
  Application.CreateForm(TForm6, Form6);
  Application.CreateForm(TLiveViewForm, LiveViewForm);
  Application.CreateForm(TFSDFileTransfer, FSDFileTransfer);
  Application.Run;
end.
