
#include <DHT.h>
#include <DHT_U.h>

#include <OneWire.h>
#include <DallasTemperature.h>

#include <Wire.h>
#include <QMC5883L.h>

#include <SoftwareSerial.h>
#include <TinyGPS++.h>

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

//Humiditysensor
#define DHT_PIN 3
DHT dht2 = DHT(DHT_PIN, DHT11);

//Light
#define PHOTO_PIN A0
#define LIGHT_PIN 5
#define LIGHT_TRESHHOLD 155

//GPS
TinyGPSPlus gps;
SoftwareSerial softwareSerial(7, 8);

#include <MemoryFree.h>

//Compass
#define compassAddr 0x0D
//QMC5883L compass;

//SD Card
#include <SPI.h>
#include <SD.h>

String bufferString;

void setup() {
  bufferString.reserve(4);
  bufferString = "";
  // put your setup code here, to run once:
  Serial.begin(9600);
  Serial.print(F("Initializing SD card..."));

  if (!SD.begin(4)) {
    Serial.println(F("initialization failed!"));
    while (1);
  }
  Serial.println(F("initialization done."));

  sensors.begin();

  //DHT11
  dht2.begin();
  
  //LIGHT
  pinMode(LIGHT_PIN, OUTPUT);
  
  //GPS
  softwareSerial.begin(9600);
  //softwareSerial.println("$GPRMC");

  //Compass
  //compass.setReg(SET_RESET_REGISTER,0x01);
  //compass.setReg(CONTROL_REGISTER,MOD_CONTINUOUS|ODR_200HZ|RNG_2G);
  
  Wire.begin();
  Wire.beginTransmission(compassAddr);
  Wire.write(0x0B);
  Wire.write(0x01);
  Wire.endTransmission();
  Wire.beginTransmission(compassAddr);
  Wire.write(0x09);
  Wire.write(0x01|0x03<<2|0x00<<4);
  Wire.endTransmission();
  /*if(!mag.begin())
  {
    Serial.println(F("Ooops, no HMC5883 detected ... Check your wiring!"));
    while(1);
  }*/

  //Serial.print("freeMemory()=");
  //Serial.println(freeMemory());
  
}
bool saveDataToSD = true;
bool doInterval = false;

unsigned long lastTime = 0;

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
  //Light
  digitalWrite(LIGHT_PIN, analogRead(PHOTO_PIN)<LIGHT_TRESHHOLD);

  //GPS
  while(softwareSerial.available() > 0){
    char c = softwareSerial.read();
    //Serial.print(c);
    gps.encode(c);
  }
}

void evaluateCommand(String bufferString){
  if(bufferString=="a\r"){
    //Serial.print(F("freeMemory()="));
    //Serial.println(freeMemory());
    //printMagnetic();
    doMeasurements();
    //Serial.println(F("Did measurements"));
    //printMagnetic();
  }else if(bufferString=="i\r"){
    doInterval = !doInterval;
    Serial.println(doInterval);
  }else if(bufferString=="logSD\r"){
    printSD();
  }
}

void doMeasurements(){
  getDateTime();
  getHumidity();
  getTemp();
  getPos();
  getMagnetic();
  
  if(saveDataToSD){
    saveValueToSD(F(""), true);
  }
  Serial.println("");
  //Serial.print(F("freeMemory()="));
  //Serial.println(freeMemory());
}

void getDateTime(){
  String result = "";
  result += gps.date.value();
  //Serial.println(gps.date.value());
  result+=";";
  result+=gps.time.value();
  result+=";";
  if(saveDataToSD){
    saveValueToSD(result, false);
  }
  Serial.print(result);
  //return result;
}

void getHumidity(){
  String result = String(dht2.readHumidity());
  result += F(";");
  if(saveDataToSD){
    saveValueToSD(result, false);
  }
  Serial.print(result);
}

void getTemp(){
  sensors.requestTemperatures();
  String result = "";
  result += sensors.getTempCByIndex(0);
  result += ";";
  result += sensors.getTempCByIndex(1);
  result += ";";
  if(saveDataToSD){
    saveValueToSD(result, false);
  }
  Serial.print(result);
  //dht2.readHumidity();
  //delay(1000);
  //result += dht2.readHumidity();
  //result += ";";
  //return result;
}

void getPos(){
  //Serial.println(gps.location.lat());
  String result = "";
  result += String(gps.location.lat(), 6);
  result += ";";
  result += String(gps.location.lng(), 6);
  result += ";";
  if(saveDataToSD){
    saveValueToSD(result, false);
  }
  Serial.print(result);
  //return result;
}

void getMagnetic() {
  //MagnetometerRaw raw = compass.readRawAxis();
  
  //return atan2(compass.readRawAxis().YAxis, compass.readRawAxis().XAxis)*180/3.14+180;
  //return String(headingDegrees, 2);
  Wire.beginTransmission(compassAddr);
  Wire.write(0x00);
  Wire.endTransmission();

  Wire.beginTransmission(compassAddr);
  Wire.requestFrom(compassAddr, 6);

  int x, y, z;
  String result = F("");
  //Serial.println(F("Requesting mag..."));
  while(Wire.available() < 6){}
  x = Wire.read() | (Wire.read() << 8);
  y = Wire.read() | (Wire.read() << 8);
  z = Wire.read() | (Wire.read() << 8);
  result += String((atan2(y, x)*180/3.14+180), 2);
  result += F(";");
  if(saveDataToSD){
    saveValueToSD(result, false);
  }
  Serial.print(result);
}

void saveValueToSD(String sensorValue, bool nl){
  File csvFile;
  csvFile = SD.open(F("data.csv"), FILE_WRITE);
  if(csvFile){
    if(nl){
      csvFile.println(sensorValue);
    }else{
      csvFile.print(sensorValue);
    }
    csvFile.close();
  }else{
    Serial.println(F("[saveValue] Error opening data.csv"));
  }
}

void saveLineToSD(String line){
  //Serial.print(F("freeMemory()="));
  //Serial.println(freeMemory());
  //Serial.print(F("sd-line: "));
  //Serial.println(line);
  File csvFile;
  //Serial.print(F("freeMemory()="));
  //Serial.println(freeMemory());
  csvFile = SD.open(F("data.csv"), FILE_WRITE);
  if(csvFile){
    csvFile.println(line);
    csvFile.close();
  }else{
    Serial.println(F("[saveLine] Error opening data.csv"));
  }
}

void printSD(){
  File csvFile = SD.open(F("data.csv"));
  if(csvFile){
    Serial.println(F("---TRANSMISSION-START---"));
    Serial.println(F("--HEADERS--"));
    Serial.println(F("BUOY-ID=001"));
    Serial.print(F("SIZE="));
    Serial.println(csvFile.size());
    Serial.println(F("DATE;TIME;HUMIDITY;AIR-TEMPERATURE;WATER-TEMPERATURE;LAT;LONG;HEADING;"));
    Serial.println(F("--BODY--"));
    while(csvFile.available()){
      Serial.write(csvFile.read());
    }
    csvFile.close();
    Serial.println(F("---TRANSMISSION-END---"));
  }else{
    Serial.println(F("Error opening data.csv"));
  }
}

