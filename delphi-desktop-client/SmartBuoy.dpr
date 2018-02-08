program SmartBuoy;

uses
  Vcl.Forms,
  SmartBuoyMain in 'SmartBuoyMain.pas' {FSmartBuoyMain},
  LiveView in 'LiveView.pas' {LiveViewForm},
  SDFileTransfer in 'SDFileTransfer.pas' {FSDFileTransfer};

{$R *.res}

begin
  Application.Initialize;
  Application.MainFormOnTaskbar := True;
  Application.CreateForm(TFSmartBuoyMain, FSmartBuoyMain);
  Application.CreateForm(TLiveViewForm, LiveViewForm);
  Application.CreateForm(TFSDFileTransfer, FSDFileTransfer);
  Application.Run;
end.
