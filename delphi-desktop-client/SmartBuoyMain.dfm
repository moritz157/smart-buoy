object Form6: TForm6
  Left = 0
  Top = 0
  Caption = 'Smart Buoy'
  ClientHeight = 522
  ClientWidth = 783
  Color = clBtnFace
  Font.Charset = DEFAULT_CHARSET
  Font.Color = clWindowText
  Font.Height = -11
  Font.Name = 'Tahoma'
  Font.Style = []
  OldCreateOrder = False
  DesignSize = (
    783
    522)
  PixelsPerInch = 96
  TextHeight = 13
  object GroupBox1: TGroupBox
    Left = 281
    Top = 264
    Width = 489
    Height = 250
    Anchors = [akTop, akRight, akBottom]
    Caption = 'Werte'
    TabOrder = 0
    ExplicitLeft = 287
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
    Width = 267
    Height = 506
    Anchors = [akLeft, akTop, akRight, akBottom]
    Caption = 'Verbindung'
    TabOrder = 1
    ExplicitWidth = 273
    DesignSize = (
      267
      506)
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
      Width = 243
      Height = 415
      Anchors = [akLeft, akTop, akRight, akBottom]
      ScrollBars = ssVertical
      TabOrder = 2
      ExplicitWidth = 209
      ExplicitHeight = 308
    end
  end
  object GroupBox3: TGroupBox
    Left = 281
    Top = 112
    Width = 489
    Height = 146
    Anchors = [akTop, akRight]
    Caption = 'Arduino Konfiguration'
    TabOrder = 2
    ExplicitLeft = 287
    object CheckBox2: TCheckBox
      Left = 16
      Top = 26
      Width = 209
      Height = 17
      Caption = 'Werte auf Micro-SD Karte speichern'
      TabOrder = 0
    end
    object RadioGroup1: TRadioGroup
      Left = 256
      Top = 26
      Width = 217
      Height = 87
      Caption = 'Lampe'
      Items.Strings = (
        'Lampe aus'
        'Lampe bei Dunkelheit an'
        'Lampe dauerhauft an')
      TabOrder = 1
    end
  end
  object GroupBox4: TGroupBox
    Left = 281
    Top = 8
    Width = 489
    Height = 98
    Anchors = [akTop, akRight]
    Caption = 'Lokale Konfiguration'
    TabOrder = 3
    ExplicitLeft = 287
    object Label3: TLabel
      Left = 176
      Top = 25
      Width = 26
      Height = 13
      Caption = 'Pfad:'
    end
    object Label4: TLabel
      Left = 188
      Top = 48
      Width = 14
      Height = 13
      Caption = 'IP:'
    end
    object CBSaveData: TCheckBox
      Left = 16
      Top = 24
      Width = 137
      Height = 17
      Caption = 'Werte lokal speichern'
      TabOrder = 0
    end
    object EdtCsvPath: TEdit
      Left = 208
      Top = 22
      Width = 130
      Height = 21
      ReadOnly = True
      TabOrder = 1
    end
    object BtnBrowseSaveData: TButton
      Left = 344
      Top = 20
      Width = 75
      Height = 25
      Caption = 'Durchsuchen'
      TabOrder = 2
      OnClick = BtnBrowseSaveDataClick
    end
    object CBUploadToServer: TCheckBox
      Left = 16
      Top = 47
      Width = 169
      Height = 17
      Caption = 'Werte zum Server hochladen'
      TabOrder = 3
    end
    object EdtServerIP: TEdit
      Left = 208
      Top = 45
      Width = 130
      Height = 21
      TabOrder = 4
      Text = '127.0.0.1'
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
    Left = 168
    Top = 240
  end
  object ComDataPacket1: TComDataPacket
    ComPort = ComPort1
    OnPacket = ComDataPacket1Packet
    Left = 176
    Top = 288
  end
  object TmrInterval: TTimer
    Enabled = False
    OnTimer = TmrIntervalTimer
    Left = 136
    Top = 328
  end
end
