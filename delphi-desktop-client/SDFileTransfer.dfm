object FSDFileTransfer: TFSDFileTransfer
  Left = 0
  Top = 0
  Caption = 'FSDFileTransfer'
  ClientHeight = 400
  ClientWidth = 699
  Color = clBtnFace
  Font.Charset = DEFAULT_CHARSET
  Font.Color = clWindowText
  Font.Height = -11
  Font.Name = 'Tahoma'
  Font.Style = []
  OldCreateOrder = False
  OnCreate = FormCreate
  OnDestroy = FormDestroy
  DesignSize = (
    699
    400)
  PixelsPerInch = 96
  TextHeight = 13
  object Label1: TLabel
    Left = 8
    Top = 47
    Width = 35
    Height = 13
    Caption = 'Status:'
  end
  object Button1: TButton
    Left = 8
    Top = 8
    Width = 129
    Height = 33
    Caption = #220'bertragung starten'
    TabOrder = 0
    OnClick = Button1Click
  end
  object PBTransmission: TProgressBar
    Left = 142
    Top = 8
    Width = 549
    Height = 33
    Anchors = [akLeft, akTop, akRight]
    TabOrder = 1
    ExplicitWidth = 323
  end
  object Memo1: TMemo
    Left = 8
    Top = 64
    Width = 683
    Height = 182
    Anchors = [akLeft, akTop, akRight]
    ScrollBars = ssVertical
    TabOrder = 2
    ExplicitWidth = 679
  end
  object GRData: TStringGrid
    Left = 8
    Top = 255
    Width = 683
    Height = 137
    Anchors = [akLeft, akTop, akRight, akBottom]
    ColCount = 1
    FixedCols = 0
    RowCount = 1
    FixedRows = 0
    TabOrder = 3
    ExplicitWidth = 679
    ExplicitHeight = 139
    RowHeights = (
      24)
  end
end
