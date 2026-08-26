# Orientation and Relative Yaw

P0 needs relative sweep direction, not global compass truth. At start, the first usable heading becomes baseline. `YawUnwrapper` uses the shortest angular delta so 359→0 is +1° and 0→359 is −1°, including repeated crossings.

Device orientation permission is requested from the Start gesture where required. States are `UNINITIALIZED`, `PERMISSION_REQUIRED`, `ACTIVE`, `UNAVAILABLE`, and `ERROR`; unavailable motion never fabricates yaw and does not prevent independent camera testing. Portrait upright and landscape primary are explicitly recognized, with screen-angle compensation. Absolute heading remains uncalibrated.
