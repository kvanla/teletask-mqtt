# teletask-mqtt
MQTT bridge for Teletask, easily connect your teletask server with homeassistant. 
Bare in mind you need the teletask OPEN DOIP PROTOCOL LICENTIE TDS15132 licence to use this. You can also use it using a test licence for free, but the program will stop working after your free licence ran out. This is a forked version of https://github.com/sillevl/teletask-mqtt



## Supported functions

* Sensor
* Relay
* Dimmer
* Motor

## Functions not 'yet' supported

* Local mood
* Time mood
* General mood
* Flags
* Audio
* Regime
* Service
* Message
* Condition

## Configuration file

```json
{
    "teletask": {
        "host": "192.168.1.1",
        "port": 55957
    },
    "mqtt": {
        "host": "192.168.1.2",
        "port": 1883
    }
}
```

If the broker is configured with a `username` and `password`, just add them to the `mqtt` object:

```json
{
    "teletask": {
        "host": "192.168.1.1",
        "port": 55957
    },
    "mqtt": {
        "host": "192.168.1.2",
        "port": 1883,
        "username": "foo",
        "password": "bar"
    }
}
```

## Docker
How to run this app:

move settings.json in main folder or pass it as a argument and mount it in your docker container,  and configure it. Run the program using docker, and always restart it, the program will crash on connection error (but this is by design, don't worry)

```
docker build . -t teletaskmqtt
docker run --restart=always --name=mqttteletask -d  teletaskmqtt 
```



## MQTT Topics

### Subscribing

Listening for new values

```
teletask/[function]/[number]
```

example:

```
teletask/relay/20
```

This will subscribe to the state of relay 20

### Publishing

Updating state

```
teletask/relay/20/set
```

To change the state of relay 20, a value of `on` or `off` must be send to this topic

## Functions

### Relay

State values can be:

* on
* off

## Integration with Home Assitant

You can integrate the `teletask-mqtt` with Home Assitant by configuring the same MQTT broker for both services. You can use a separate MQTT broker, or the internal Home Assistant broker. Simply run this program on your homeassistant server.

### Light example configuration

An example of integrating a `light` in the Home Assistant `configuration.yaml`

The number in the `topic`s should be configured with the number that is being assigned within the Teletask configuration.

```yaml
mqtt:
  light:
    - command_topic: "teletask/relay/3/set"
      state_topic: "teletask/relay/3"
      name: yourname
      payload_on: "on"
      payload_off: "off"
      unique_id: "set_your_id"
```

### Sensor example configuration

An example of integrating a `sensor` in the Home Assistant `configuration.yaml`

The number in the `topic`s should be configured with the number that is being assigned within the Teletask configuration.

```yaml
mqtt:
  sensor:
    - state_topic: "teletask/sensor/21"
      name: yourname
      unit_of_measurement: "°C"
```

### dimmer example configuration

An example of integrating a `dimmer` in the Home Assistant `configuration.yaml`

The number in the `topic`s should be configured with the number that is being assigned within the Teletask configuration.

```yaml
mqtt:
    light: 
        - command_topic: "teletask/dimmer/1/set"
        state_topic: "teletask/dimmer/1"
        name: yourname
        payload_on: "100"
        payload_off: "0"
        unique_id: "dimmer/1"
```

### fan example configuration

An example of integrating a `dimmer` in the Home Assistant `configuration.yaml`

The number in the `topic`s should be configured with the number that is being assigned within the Teletask configuration.

```yaml
mqtt:
  fan:
    - name: "ventilator"
      state_topic: "teletask/dimmer/8"
      command_topic: "teletask/dimmer/8/set"
      percentage_command_topic: "teletask/dimmer/8/set"
      percentage_command_template: "{{ value }}"
      percentage_value_template: "{{value}}"
      payload_on: "100"
      payload_off: "0"
      unique_id: "dimmer/8"
```

### Motor example configuration

An example of integrating a `motor` in the Home Assistant `configuration.yaml`

The number in the `topic`s should be configured with the number that is being assigned within the Teletask configuration. Position value is inverted

```yaml
mqtt:
    - name: "yourname"
      unique_id: "unique_id"
      optimistic: true
      position_open: 100
      position_closed: 0
      set_position_topic: "teletask/motor/1/set"
      position_topic: "teletask/motor/1"
      position_template: "{{100 - int(value) }}"
      set_position_template: "{{100 - int(value) }}"
```

