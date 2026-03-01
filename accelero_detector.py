# SPDX-FileCopyrightText: Copyright (C) ARDUINO SRL (http://www.arduino.cc)
#
# SPDX-License-Identifier: MPL-2.0

from arduino.app_utils import *
import math
import time

# ── Thresholds (tune these to your sensor placement) ──────────────────────────
FREE_FALL_THRESHOLD = 0.5   # g   — magnitude below this = free-fall phase
IMPACT_THRESHOLD    = 2.5   # g   — magnitude above this = impact phase
FALL_WINDOW         = 0.6   # sec — impact must follow free-fall within this window

logger = Logger("fall-detection")
logger.info(
    f"Thresholds: FREE_FALL < {FREE_FALL_THRESHOLD}g  |  "
    f"IMPACT > {IMPACT_THRESHOLD}g  |  WINDOW = {FALL_WINDOW}s"
)

# Internal state — timestamp of the last free-fall event
_free_fall_time = None


def _magnitude(x: float, y: float, z: float) -> float:
    """Total acceleration magnitude in g."""
    return math.sqrt(x**2 + y**2 + z**2)


def record_sensor_movement(x: float, y: float, z: float):
    """
    Called from the sketch via Bridge.notify("record_sensor_movement", x, y, z).
    x, y, z are raw g-values from the accelerometer.
    """
    global _free_fall_time
    logger.debug(f"sample  x={x:.3f}g  y={y:.3f}g  z={z:.3f}g")

    try:
        mag = _magnitude(x, y, z)
        now = time.time()

        # ── Always print the raw sample for debugging ─────────────────────────
        sample = {"t": now, "x": float(x), "y": float(y), "z": float(z)}
        # print(sample)

        # ── Phase 1: free-fall — magnitude collapses toward 0g ────────────────
        if mag < FREE_FALL_THRESHOLD:
            if _free_fall_time is None:
                _free_fall_time = now
                logger.debug(f"Free-fall phase started  mag={mag:.3f}g")
            print(f"[FREE-FALL]  mag={mag:.3f}g")

        # ── Phase 2: impact — spike following a recent free-fall ──────────────
        elif mag > IMPACT_THRESHOLD:
            if _free_fall_time is not None and (now - _free_fall_time) <= FALL_WINDOW:
                elapsed = now - _free_fall_time
                print()
                print("=" * 50)
                print("  !! FALL DETECTED !!")
                print(f"     Impact magnitude : {mag:.3f}g")
                print(f"     Free-fall → impact : {elapsed:.3f}s")
                print("=" * 50)
                print()
                logger.warning(f"FALL DETECTED  mag={mag:.3f}g  elapsed={elapsed:.3f}s")
            else:
                # High-g jolt with no prior free-fall → e.g. hard tap, not a fall
                print(f"[JOLT]       mag={mag:.3f}g  (no preceding free-fall — ignored)")
                logger.debug(f"High-g jolt without free-fall  mag={mag:.3f}g")
            _free_fall_time = None   # reset after any impact

        # ── Normal activity ───────────────────────────────────────────────────
        else:
            # Expire a stale free-fall if the window passed with no impact
            if _free_fall_time is not None and (now - _free_fall_time) > FALL_WINDOW:
                logger.debug("Free-fall window expired with no impact — resetting")
                _free_fall_time = None
            print(f"[NORMAL]     mag={mag:.3f}g")

    except Exception as e:
        logger.exception(f"record_sensor_movement: Error: {e}")
        print(f"record_sensor_movement: Error: {e}")


# Register the Bridge RPC provider so the sketch can call into Python
try:
    logger.debug("Registering 'record_sensor_movement' Bridge provider")
    Bridge.provide("record_sensor_movement", record_sensor_movement)
    logger.debug("'record_sensor_movement' registered successfully")
except RuntimeError:
    logger.debug("'record_sensor_movement' already registered")

logger.info("Fall detection app running — waiting for sensor data...")
App.run()
