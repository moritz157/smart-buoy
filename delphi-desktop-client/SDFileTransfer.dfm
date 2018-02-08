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
  object LblStatus: TLabel
    Left = 8
    Top = 47
    Width = 3
    Height = 13
  end
  object BtnStartTransmission: TButton
    Left = 8
    Top = 8
    Width = 129
    Height = 33
    Caption = #220'bertragung starten'
    TabOrder = 0
    OnClick = BtnStartTransmissionClick
  end
  object PBTransmission: TProgressBar
    Left = 142
    Top = 8
    Width = 549
    Height = 33
    Anchors = [akLeft, akTop, akRight]
    TabOrder = 1
  end
  object GRData: TStringGrid
    Left = 8
    Top = 78
    Width = 683
    Height = 314
    Anchors = [akLeft, akTop, akRight, akBottom]
    ColCount = 1
    FixedCols = 0
    RowCount = 1
    FixedRows = 0
    Options = [goFixedVertLine, goFixedHorzLine, goVertLine, goHorzLine, goRangeSelect, goDrawFocusSelected, goRowSizing]
    TabOrder = 2
    RowHeights = (
      24)
  end
  object BtnSaveAsCsv: TButton
    Left = 584
    Top = 47
    Width = 107
    Height = 25
    Anchors = [akTop, akRight]
    Caption = 'Als CSV speichern'
    Enabled = False
    TabOrder = 3
    OnClick = BtnSaveAsCsvClick
  end
end
