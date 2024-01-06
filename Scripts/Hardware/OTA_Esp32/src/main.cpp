
#include <WiFi.h>
#include <Wire.h>
#include <Adafruit_BME280.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_TCS34725.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <time.h>
#include <esp32fota.h>
#include <FS.h>
#include <SPIFFS.h>
#include <WiFiManager.h>
// https://dronebotworkshop.com/wifimanager/
//  JSON configuration file

// Define WiFiManager Object
WiFiManager wm;

// esp32fota esp32fota("<Type of Firme for this device>", <this version>, <validate signature>);
esp32FOTA esp32FOTAmy("esp32-fota-http", "1.0.2", false);
unsigned long lastHttpResponseTime = 0;
unsigned long httpResponseInterval = 5000; // 5 seconds

unsigned long lastSensorDataTime = 0;
unsigned long sensorDataInterval = 60000; // 1 minute
const char *manifest_url = "http://192.168.178.121:8080/api/hardware/update";

// const char *manifest_url = "https://backend.nexaharvest.com/api/hardware/update";
//  Replace the next variables with your SSID/Password combination
const char *ssid = "5551 2771";
const char *password = "a16c41b0f19cd116c4f1672ebe";

// getting the current time
const char *ntpServer = "pool.ntp.org";

// define the timeout for the http request
const int timeout = 5000; // 5 seconds
const int maxRetries = 50;

// backend server //for mongodb credentials
const char *hostBackendHardware = "http://192.168.178.121:8080/api/hardware";
// const char *hostBackendHardware = "https://backend.nexaharvest.com/api/hardware";

// const int deviceId = 1;
String deviceId = String(ESP.getEfuseMac(), HEX); // Convert uint64_t to String
// digital sensors
Adafruit_BME280 bme; // I2C
Adafruit_TCS34725 tcs = Adafruit_TCS34725(TCS34725_INTEGRATIONTIME_614MS, TCS34725_GAIN_1X);

// start values
long lastMsg = 0;
int value = 0;

// define sensor pins
#define AOUT_PIN 35
#define AOUT_PIN2 34
#define AOUT_PIN3 33
#define BUTTON_PIN 15

// define sensor variables
float temperature = 0;
float humidity = 0;
float pressure = 0;
float moisture_1 = 0;
float moisture_2 = 0;
float moisture_3 = 0;

// Define the LED pins
const int led_1 = 27;
const int led_2 = 14;
const int led_3 = 16;
const int led_4 = 17;
const int ledStatus = 18;

// Define the API key
String apiKey, hostMongo, url, group;

void initializeNTP()
{
  configTime(0, 0, ntpServer);
  setenv("TZ", "CET-1CEST,M3.5.0,M10.5.0/3", 1);
  tzset();
}
void makeRequest()
{
  HTTPClient http;
  http.setTimeout(timeout);

  int retries = 0;
  int httpCode = 0;

  do
  {

    http.begin(String(hostBackendHardware)); // Specify the URL
    http.addHeader("Content-Type", "application/json");
    http.addHeader("deviceId", String(deviceId));

    httpCode = http.GET(); // Make the request
    String response = http.getString();

    if (httpCode == 200 && response != "{\"message\":\"Invalid device ID or device not found\"}")
    { // Check for the returning code
      Serial.println("Data received successfully from backend server");
      // Parse JSON
      DynamicJsonDocument doc(1024);
      // Deserialize the JSON document
      DeserializationError error = deserializeJson(doc, response);

      // Test if parsing succeeds.
      if (error)
      {
        Serial.print("deserializeJson() failed: ");
        Serial.println(error.f_str());
        digitalWrite(ledStatus, HIGH);
        return;
      }

      hostMongo = doc["host"].as<String>();
      url = doc["url"].as<String>();
      apiKey = doc["apiKey"].as<String>();
      group = doc["group"].as<String>();
    }
    else
    {
      Serial.println("[Backend Hardware] Error on HTTP request: " + String(http.errorToString(httpCode)));
      retries++;
      digitalWrite(ledStatus, HIGH);
      delay(1000); // wait for a second before retrying
    }

    http.end(); // Free the resources
  } while (httpCode != 200 && retries < maxRetries);
}
std::vector<const char *> wmMenuItems = {"wifi", "info", "param", "exit"}; //"erase"

void WifiManager()
{
  // Explicitly set WiFi mode
  WiFi.mode(WIFI_STA);
  delay(10);
  wm.setMenu(wmMenuItems);
  wm.setTitle("Brand Name");                 // brand name
  int buttonState = digitalRead(BUTTON_PIN); // Read the state of the button

  Serial.println("[Wifi] Resetting Wifi-Settings" + String(buttonState));
  if (buttonState == LOW)
  {                                                    // If the button is pressed (connects the pin to GND)
    wm.startConfigPortal("ESP32 Network", "password"); // Start the
  }
  else
  {
    if (!wm.autoConnect("NEWTEST_AP", "password")) // brand name
    {
      Serial.println("[Wifi] failed to connect and hit timeout");
      delay(3000);
      // if we still have not connected restart and try all over again
      ESP.restart();
      delay(5000);
    }
    else
    {
      // if you get here you have connected to the WiFi
      Serial.println("[Wifi] connected...yeey :)");
    }
  }

  // If we get here, we are connected to the WiFi
  Serial.println("[Wifi] WiFi connected");
  Serial.print("[Wifi] IP address: ");
  Serial.println(WiFi.localIP());
  Serial.print("[Wifi] MAC address: ");
  Serial.println(WiFi.macAddress());
}
void setup()
{
  // Start the serial connection
  Serial.begin(115200);
  delay(1000);

  // Initialize the LED pins as output and set them to LOW
  pinMode(led_1, OUTPUT);
  digitalWrite(led_1, HIGH);

  pinMode(led_2, OUTPUT);
  digitalWrite(led_2, HIGH);

  pinMode(led_3, OUTPUT);
  digitalWrite(led_3, HIGH);

  pinMode(led_4, OUTPUT);
  digitalWrite(led_4, HIGH);

  pinMode(ledStatus, OUTPUT);
  digitalWrite(ledStatus, HIGH);
  // reset button
  pinMode(BUTTON_PIN, INPUT_PULLUP);

  // Initialize I2C communication
  Wire.begin();

  // Check BME280 sensor connection
  if (!bme.begin(0x76))
  { // Replace 0x76 with the appropriate sensor address
    Serial.println("[Wiring] Failed to connect to the BME280 sensor. Please check the wiring.");
    digitalWrite(ledStatus, HIGH);
    while (1)
      ; // Halt the program if the sensor connection fails
  }

  // Check TCS34725 sensor connection
  if (!tcs.begin())
  {
    Serial.println("[Wiring] Failed to connect to the TCS34725 sensor. Please check the wiring.");
    digitalWrite(ledStatus, HIGH);
    while (1)
      ; // Halt the program if the sensor connection fails
  }

  WifiManager();
  // check for update

  // set update things
  esp32FOTAmy.setManifestURL(manifest_url);
  esp32FOTAmy.printConfig();
  // init and get the time
  initializeNTP();

  // get the mongodb credentials
  makeRequest();
}

void sendToServer(String topic, String group, String value)
{
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo))
  {
    Serial.println("[Sensor Data Server] Failed to obtain time");
    digitalWrite(ledStatus, HIGH);
    return;
  }
  char timeStringBuff[50]; // 50 chars should be enough
  strftime(timeStringBuff, sizeof(timeStringBuff), "%Y-%m-%dT%H:%M:%S.000Z", &timeinfo);
  String timeStr = String(timeStringBuff);

  // Create a JSON object
  String json = "{\"topic\":\"" + topic + "\",\"group\":\"" + group + "\",\"value\":\"" + value + "\",\"time\":{\"$date\":\"" + timeStr + "\"}}";
  HTTPClient http;
  http.begin("https://" + hostMongo + url + "/action/insertOne");
  http.addHeader("Content-Type", "application/ejson");
  http.addHeader("Accept", "application/json");
  http.addHeader("api-key", apiKey); // Specify content-type header
  String requestData = "{\"collection\":\"datas\",\"database\":\"Website\",\"dataSource\":\"Cluster0\",\"document\":" + json + "}";
  int httpResponseCode = http.POST(requestData);

  if (httpResponseCode == 200 || httpResponseCode == 201)
  {
    Serial.println("[Sensor Data Server] Data sent successfully");
    String response = http.getString();
  }
  else
  {
    Serial.print("[Sensor Data Server] Error on sending POST (error nor clear): ");
    digitalWrite(ledStatus, HIGH);
    String response = http.getString();
    Serial.println(response);
  }

  http.end(); // Free resources
}
void processHttpResponse()
{
  HTTPClient http;
  http.begin("https://" + hostMongo + url + "/action/find");
  Serial.println("[Get Actions] from: https://" + hostMongo + url + "/action/find");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Access-Control-Request-Headers", "*");
  http.addHeader("api-key", apiKey);

  String requestData = "{\"collection\":\"actions\",\"database\":\"Website\",\"dataSource\":\"Cluster0\"}";
  int httpResponseCode = http.POST(requestData);
  String response = http.getString();
  Serial.println(response);
  if (httpResponseCode == 200)
  {
    // Check if the response is not empty
    Serial.println("[Get Actions] Data received successfully");
    if (response.length() > 0)
    {
      // Parse the JSON response
      DynamicJsonDocument doc(3500); // change this if we change the schema of actions
      DeserializationError error = deserializeJson(doc, response);

      // Check for errors in parsing
      if (error)
      {
        Serial.print(F("[Get Actions] deserializeJson() failed with code "));
        Serial.println(error.c_str());
        Serial.println(response);
        digitalWrite(ledStatus, HIGH);
      }
      else
      {
        // Loop through each document in the response
        for (JsonObject document : doc["documents"].as<JsonArray>())
        {
          String object = document["object"];
          String value = document["value"];

          // Turn on or off the LED based on the object value
          if (object == "pump_1")
          {
            digitalWrite(led_1, value == "on" ? LOW : HIGH);
            Serial.println(value == "on" ? "[Backend status] Pump 1 is turned on" : "[Backend status] Pump 1 is turned off");
          }
          else if (object == "led_1")
          { // Corrected object name
            digitalWrite(led_2, value == "on" ? LOW : HIGH);
            Serial.println(value == "on" ? "[Backend status] Led 1 is turned on" : "[Backend status] Led 1 is turned off");
          }
          else if (object == "ventilator_1")
          {
            digitalWrite(led_3, value == "on" ? LOW : HIGH);
            Serial.println(value == "on" ? "[Backend status] Ventilator 1 is turned on" : "[Backend status] Ventilator 1 is turned off");
          }
          else if (object == "ventilator_2")
          {
            digitalWrite(led_4, value == "on" ? LOW : HIGH);
            Serial.println(value == "on" ? "[Backend status] Ventilator 2 is turned on" : "[Backend status] Ventilator 2 is turned off");
          }
        }
      }
    }
    else
    {
      Serial.println("[Get Actions] Empty response received");
    }
  }
  else
  {
    Serial.print("[Get Actions] Error on sending POST to get actions Data: ");
    digitalWrite(ledStatus, HIGH);
    String response = http.getString();
    Serial.println(response);
  }

  http.end();
}
void sendSensorData(float value, const char *topic)
{
  char valueString[8];
  dtostrf(value, 1, 2, valueString);
  String payload = String(valueString);
  sendToServer(topic, group, payload);
}
void sendSensorData()
{

  // temperature
  temperature = bme.readTemperature();
  sendSensorData(temperature, "esp/air/temperature");

  // humidity
  humidity = bme.readHumidity();
  sendSensorData(humidity, "esp/air/humidity");

  // pressure
  pressure = (bme.readPressure() / 100.0F);
  sendSensorData(pressure, "esp/air/pressure");

  // moisture/1
  moisture_1 = analogRead(AOUT_PIN);
  sendSensorData(moisture_1, "esp/ground/moisture/1");

  // moisture/2
  moisture_2 = analogRead(AOUT_PIN);
  sendSensorData(moisture_2, "esp/ground/moisture/2");

  // moisture/3
  moisture_3 = analogRead(AOUT_PIN);
  sendSensorData(moisture_3, "esp/ground/moisture/3");

  // light/colorTemp
  uint16_t r, g, b, c, colorTemp, lux;
  tcs.getRawData(&r, &g, &b, &c);
  colorTemp = tcs.calculateColorTemperature_dn40(r, g, b, c);
  lux = tcs.calculateLux(r, g, b);
  sendSensorData(colorTemp, "esp/ground/light/colorTemp");

  // light/lux
  sendSensorData(lux, "esp/ground/light/lux");

  // light/red
  sendSensorData(r, "esp/ground/light/red");

  // light/green
  sendSensorData(g, "esp/ground/light/green");

  // light/blue
  sendSensorData(b, "esp/ground/light/blue");

  // light/clear
  sendSensorData(c, "esp/ground/light/clear");
}

void loop()
{
  bool updatedNeeded = esp32FOTAmy.execHTTPcheck();
  if (updatedNeeded)
  {
    esp32FOTAmy.execOTA();
  }

  unsigned long currentMillis = millis();
  if (currentMillis - lastHttpResponseTime >= httpResponseInterval)
  {
    lastHttpResponseTime = currentMillis;
    printf("[System loop] Processing http response...\n");
    processHttpResponse();
  }

  if (currentMillis - lastSensorDataTime >= sensorDataInterval)
  {
    lastSensorDataTime = currentMillis;
    printf("[System loop] Sending data to server...\n");
    sendSensorData();
  }
}