object Form6: TForm6
  Left = 0
  Top = 0
  Caption = 'Smart Buoy'
  ClientHeight = 415
  ClientWidth = 703
  Color = clBtnFace
  Font.Charset = DEFAULT_CHARSET
  Font.Color = clWindowText
  Font.Height = -11
  Font.Name = 'Tahoma'
  Font.Style = []
  OldCreateOrder = False
  PixelsPerInch = 96
  TextHeight = 13
  object GroupBox1: TGroupBox
    Left = 247
    Top = 8
    Width = 434
    Height = 399
    Caption = 'Werte'
    TabOrder = 0
    object Label2: TLabel
      Left = 22
      Top = 72
      Width = 60
      Height = 13
      Caption = 'Temperatur:'
    end
    object LblTemp: TLabel
      Left = 88
      Top = 72
      Width = 3
      Height = 13
    end
    object Button2: TButton
      Left = 22
      Top = 27
      Width = 91
      Height = 25
      Caption = 'Daten abfragen'
      TabOrder = 0
      OnClick = Button2Click
    end
    object EdtInterval: TEdit
      Left = 209
      Top = 29
      Width = 113
      Height = 21
      NumbersOnly = True
      TabOrder = 1
      TextHint = 'Interval (Sekunden)'
    end
    object BtnInterval: TButton
      Left = 328
      Top = 27
      Width = 91
      Height = 25
      Caption = 'Interval starten'
      TabOrder = 2
      OnClick = BtnIntervalClick
    end
  end
  object GroupBox2: TGroupBox
    Left = 8
    Top = 8
    Width = 233
    Height = 399
    Caption = 'Verbindung'
    TabOrder = 1
    object Label1: TLabel
      Left = 13
      Top = 56
      Width = 35
      Height = 13
      Caption = 'Status:'
    end
    object Lbl_Status: TLabel
      Left = 54
      Top = 56
      Width = 43
      Height = 13
      Caption = 'Getrennt'
    end
    object BtnConnect: TButton
      Left = 127
      Top = 27
      Width = 90
      Height = 25
      Caption = 'Verbinden'
      TabOrder = 0
      OnClick = BtnConnectClick
    end
    object EdtPort: TEdit
      Left = 8
      Top = 29
      Width = 113
      Height = 21
      TabOrder = 1
      Text = 'COM3'
    end
    object Memo1: TMemo
      Left = 8
      Top = 80
      Width = 209
      Height = 308
      TabOrder = 2
    end
  end
  object ComPort1: TComPort
    BaudRate = br9600
    Port = 'COM3'
    Parity.Bits = prNone
    StopBits = sbOneStopBit
    DataBits = dbEight
    Events = [evRxChar, evTxEmpty, evRxFlag, evRing, evBreak, evCTS, evDSR, evError, evRLSD, evRx80Full]
    FlowControl.OutCTSFlow = False
    FlowControl.OutDSRFlow = False
    FlowControl.ControlDTR = dtrDisable
    FlowControl.ControlRTS = rtsDisable
    FlowControl.XonXoffOut = False
    FlowControl.XonXoffIn = False
    StoredProps = [spBasic]
    TriggersOnRxChar = False
    OnAfterOpen = ComPort1AfterOpen
    OnAfterClose = ComPort1AfterClose
    OnBeforeOpen = ComPort1BeforeOpen
    OnBeforeClose = ComPort1BeforeClose
    OnRxChar = ComPort1RxChar
    OnRxBuf = ComPort1RxBuf
    Left = 240
    Top = 128
  end
  object ComDataPacket1: TComDataPacket
    ComPort = ComPort1
    OnPacket = ComDataPacket1Packet
    Left = 240
    Top = 184
  end
  object TmrInterval: TTimer
    Enabled = False
    OnTimer = TmrIntervalTimer
    Left = 264
    Top = 240
  end
end