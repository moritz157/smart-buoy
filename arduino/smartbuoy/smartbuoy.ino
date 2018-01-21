#include <OneWire.h>
#include <DallasTemperature.h>

// Data wire is plugged into pin 2 on the Arduino 
#define ONE_WIRE_BUS 2 
/********************************************************************/
// Setup a oneWire instance to communicate with any OneWire devices  
// (not just Maxim/Dallas temperature ICs) 
OneWire oneWire(ONE_WIRE_BUS); 
/********************************************************************/
// Pass our oneWire reference to Dallas Temperature. 
DallasTemperature sensors(&oneWire);
/********************************************************************/ 

//SD Card
#include <SPI.h>
#include <SD.h>

File csvFile;

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  Serial.print("Initializing SD card...");

  if (!SD.begin(4)) {
    Serial.println("initialization failed!");
    while (1);
  }
  Serial.println("initialization done.");

  sensors.begin();
}
bool saveDataToSD = true;
bool doInterval = false;

String bufferString = "";
long lastTime = 0;
void loop() {
  // put your main code here, to run repeatedly:
  if(Serial.available() > 0){
    char input = Serial.read();
    bufferString+=input;
    if(input=='\r'){
      evaluateCommand(bufferString);
      bufferString="";
    }
  }
  if(doInterval && millis() - 20000 > lastTime){
    lastTime = millis();
    doMeasurements();
  }
}

void evaluateCommand(String bufferString){
  if(bufferString=="a\r"){
     doMeasurements();
  }else if(bufferString=="i\r"){
    doInterval = !doInterval;
    Serial.println(doInterval);
  }
}

void doMeasurements(){
  sensors.requestTemperatures();
  float temp = sensors.getTempCByIndex(0);
  if(saveDataToSD){
    saveLineToSD(String(temp) + ";");
  }
  Serial.println(temp);
}

void saveLineToSD(String line){
  csvFile = SD.open("SMART-~1.csv", FILE_WRITE);
  if(csvFile){
    csvFile.println(line);
    csvFile.close();
  }else{
    Serial.println("Error opening smart-buoy.csv");
  }
}

