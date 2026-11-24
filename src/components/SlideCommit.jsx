import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion as Motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import "./SlideCommit.css";

const PAD = 4;
const SQUASH_MAX = 0.08;
const SQUASH_DIV = 110;
const SWELL = 1.03;
const MIN_PENDING = 300;
const EASE_OUT = [0.23, 1, 0.32, 1];
const SHAKE = [0, -5, 5, -3, 3, -1, 0];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const onColor = (hex) => {
  const raw = hex.replace("#", "");
  const full =
    raw.length === 3
      ? [...raw].map((character) => character + character).join("")
      : raw.slice(0, 6);
  const number = parseInt(full, 16);
  if (Number.isNaN(number)) return "#ffffff";
  const yiq =
    (((number >> 16) & 255) * 299 +
      ((number >> 8) & 255) * 587 +
      (number & 255) * 114) /
    1000;
  return yiq >= 128 ? "#111111" : "#ffffff";
};
const velocityOf = (history) => {
  if (history.length < 2) return 0;
  const [startTime, startX] = history[0];
  const [endTime, endX] = history[history.length - 1];
  return ((endX - startX) / Math.max(1, endTime - startTime)) * 1000;
};
const finePointer = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;

const Spinner = ({ size }) => (
  <svg
    className="slide-commit__spinner"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeOpacity="0.25"
    />
    <path
      d="M12 3a9 9 0 0 1 9 9"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  </svg>
);

function SlideCommit({
  label = "Slide to start",
  doneLabel = "Welcome",
  errorLabel = "please try again",
  onConfirm,
  onDone,
  onError,
  trackColor = "#20211f",
  handleColor = "#f5f4ef",
  successColor = "#b7f36b",
  dangerColor = "#e5484d",
  width = 280,
  height = 56,
  radius = 28,
  speed = 50,
  returnBounce = 0.38,
  landingDip = 0.026,
  holdMs = 1500,
  disabled = false,
  icon,
  className = "",
}) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState("idle");
  const [held, setHeld] = useState(false);
  const [hot, setHot] = useState(false);
  const trackRef = useRef(null);
  const capsuleRef = useRef(null);
  const grip = useRef(null);
  const timer = useRef(0);
  const homeTimer = useRef(0);
  const run = useRef(0);
  const unwatch = useRef(null);
  const live = useRef({ move: () => {}, up: () => {} });
  const lastPercent = useRef(0);
  const gripSize = height - PAD * 2;
  const inner = width - PAD * 2;
  const travel = Math.max(1, inner - gripSize);
  const trackRadius = clamp(radius, 0, height / 2);
  const gripRadius = Math.max(0, trackRadius - PAD);
  const springStiffness = 260 + (clamp(speed, 0, 100) / 100) * 640;
  const mass = 0.9;
  const critical = 2 * Math.sqrt(springStiffness * mass);
  const commitSpring = {
    type: "spring",
    stiffness: springStiffness,
    damping: critical,
    mass,
  };
  const homeSpring = {
    ...commitSpring,
    damping: critical * (1 - clamp(returnBounce, 0, 0.5)),
  };
  const x = useMotionValue(0);
  const anchor = useMotionValue(0);
  const shown = useMotionValue(1);
  const spin = useMotionValue(0);
  const pulse = useMotionValue(1);
  const shake = useMotionValue(0);
  const seen = useTransform(x, (value) => clamp(value, 0, travel));
  const edge = useTransform(
    [seen, anchor],
    ([value, anchorValue]) =>
      value + gripSize + clamp(anchorValue - value, 0, travel)
  );
  const clip = useTransform(
    edge,
    (value) => `inset(0 ${inner - value}px 0 0 round ${gripRadius}px)`
  );
  const content = useTransform(
    [seen, edge],
    ([value, edgeValue]) => `translateX(${(value + edgeValue) / 2 - inner / 2}px)`
  );
  const swell = hot && !held && phase === "idle" && !reduce ? SWELL : 1;
  const shape = useTransform(x, (value) => {
    const squash =
      1 - Math.min(SQUASH_MAX, Math.max(0, -value) / SQUASH_DIV);
    return `scale(${squash * swell}, ${swell / squash})`;
  });
  const origin = useTransform(seen, (value) => `${value}px 50%`);
  const say = useTransform(seen, [0, travel * 0.55], [1, 0]);
  const arrow = useTransform(
    [seen, shown],
    ([value, visible]) =>
      visible * clamp(1 - (value - travel * 0.55) / (travel * 0.4), 0, 1)
  );
  const trackTransform = useTransform(
    [shake, pulse],
    ([shakeValue, pulseValue]) =>
      `translateX(${shakeValue}px) scale(${pulseValue})`
  );
  const labelText = typeof label === "string" ? label : "Slide to confirm";

  useMotionValueEvent(seen, "change", (value) => {
    const percent = Math.round((value / travel) * 100);
    if (percent === lastPercent.current || !capsuleRef.current) return;
    lastPercent.current = percent;
    capsuleRef.current.setAttribute("aria-valuenow", String(percent));
    capsuleRef.current.setAttribute(
      "aria-valuetext",
      `${labelText}, ${percent}%`
    );
  });

  useEffect(
    () => () => {
      clearTimeout(timer.current);
      clearTimeout(homeTimer.current);
      unwatch.current?.();
      run.current += 1;
    },
    []
  );

  const local = (clientX) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    return (clientX - rect.left) / (rect.width / width || 1);
  };
  const goHome = (velocity) => {
    if (reduce) animate(x, 0, { duration: 0.2, ease: EASE_OUT });
    else animate(x, 0, { ...homeSpring, velocity: Math.min(0, velocity) });
  };
  const settle = () => {
    setPhase("idle");
    animate(shown, 1, { duration: 0.2, delay: 0.12 });
    if (reduce) anchor.set(0);
    else animate(anchor, 0, { type: "spring", duration: 0.3, bounce: 0 });
  };
  const resolve = (viaKey) => {
    setPhase("done");
    anchor.set(x.get());
    animate(spin, 0, { duration: 0.12 });
    if (reduce) x.set(0);
    else {
      animate(x, 0, commitSpring);
      if (!viaKey && landingDip > 0) {
        animate(pulse, [1, 1 - landingDip, 1], {
          duration: 0.46,
          times: [0, 0.62, 1],
          ease: EASE_OUT,
          delay: 0.1,
        });
      }
    }
    onDone?.();
    if (holdMs > 0) timer.current = setTimeout(settle, holdMs);
  };
  const reject = (reason) => {
    setPhase("error");
    onError?.(reason);
    animate(spin, 0, { duration: 0.12 });
    animate(shown, 1, { duration: 0.2, delay: 0.12 });
    if (reduce) goHome(0);
    else {
      animate(shake, SHAKE, { duration: 0.45, ease: EASE_OUT });
      homeTimer.current = setTimeout(() => {
        if (!grip.current) goHome(0);
      }, 300);
    }
    timer.current = setTimeout(
      () => setPhase("idle"),
      Math.max(holdMs, 1500)
    );
  };
  const commit = (viaKey) => {
    clearTimeout(timer.current);
    const id = ++run.current;
    x.set(travel);
    let result;
    try {
      result = onConfirm?.();
    } catch (reason) {
      reject(reason);
      return;
    }
    const pending = result && typeof result.then === "function" ? result : null;
    if (!pending) {
      animate(shown, 0, { duration: 0.12 });
      resolve(viaKey);
      return;
    }
    setPhase("pending");
    animate(shown, 0, { duration: 0.2 });
    animate(spin, 1, { duration: 0.2 });
    const started = performance.now();
    const later = (callback) => {
      setTimeout(
        () => {
          if (id === run.current) callback();
        },
        Math.max(0, MIN_PENDING - (performance.now() - started))
      );
    };
    pending.then(
      () => later(() => resolve(viaKey)),
      (reason) => later(() => reject(reason))
    );
  };
  const down = (event) => {
    if (
      disabled ||
      grip.current ||
      phase === "pending" ||
      phase === "done" ||
      event.button !== 0
    )
      return;
    x.stop();
    grip.current = {
      id: event.pointerId,
      grab: null,
      moved: false,
      hist: [],
    };
    setHeld(true);
    try {
      trackRef.current?.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is not available in every browser.
    }
    unwatch.current?.();
    const onMove = (moveEvent) =>
      moveEvent.isTrusted && live.current.move(moveEvent);
    const onUp = (upEvent) =>
      upEvent.isTrusted && live.current.up(upEvent);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    unwatch.current = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      unwatch.current = null;
    };
  };
  const move = (event) => {
    const currentGrip = grip.current;
    if (!currentGrip || currentGrip.id !== event.pointerId) return;
    const at = local(event.clientX);
    if (currentGrip.grab === null) {
      currentGrip.grab = at - x.get();
      return;
    }
    const next = clamp(at - currentGrip.grab, 0, travel);
    if (Math.abs(next - x.get()) > 0.5) currentGrip.moved = true;
    currentGrip.hist.push([event.timeStamp, next]);
    if (currentGrip.hist.length > 4) currentGrip.hist.shift();
    x.set(next);
  };
  const up = (event) => {
    const currentGrip = grip.current;
    if (!currentGrip || currentGrip.id !== event.pointerId) return;
    grip.current = null;
    unwatch.current?.();
    try {
      trackRef.current?.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already have been released.
    }
    setHeld(false);
    if (x.get() >= travel) commit(false);
    else if (currentGrip.moved) goHome(velocityOf(currentGrip.hist));
  };
  useEffect(() => {
    live.current = { move, up };
  });
  const onKeyDown = (event) => {
    if (disabled || phase === "pending" || phase === "done") return;
    const step = travel / 10;
    if (event.key === "End") {
      event.preventDefault();
      commit(true);
    } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      const next = Math.min(travel, x.get() + step);
      x.set(next);
      if (next >= travel) commit(true);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      x.set(Math.max(0, x.get() - step));
    } else if (event.key === "Home" || event.key === "Escape") {
      event.preventDefault();
      if (grip.current) up({ pointerId: grip.current.id });
      else x.set(0);
    }
  };
  const fontSize = clamp(Math.round(height * 0.25), 13, 17);
  const iconSize = Math.round(gripSize * 0.42);
  const done = phase === "done";

  return (
    <div
      className={`slide-commit${className ? ` ${className}` : ""}`}
      data-phase={phase}
      data-held={held ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      style={{
        width,
        height,
        "--sc-track": trackColor,
        "--sc-ink": handleColor,
        "--sc-ok": successColor,
        "--sc-no": dangerColor,
        "--sc-on-ink": onColor(handleColor),
        "--sc-on-ok": onColor(successColor),
        "--sc-on-no": onColor(dangerColor),
        "--sc-radius": `${trackRadius}px`,
        "--sc-grip-r": `${gripRadius}px`,
        "--sc-pad": `${PAD}px`,
        "--sc-font": `${fontSize}px`,
      }}
    >
      <Motion.div
        ref={trackRef}
        className="slide-commit__track"
        style={{ transform: trackTransform }}
        onPointerDown={down}
      >
        <Motion.span
          className="slide-commit__label"
          style={{ opacity: say }}
          aria-hidden="true"
        >
          <span className="slide-commit__text slide-commit__text--plain">
            {label}
          </span>
          <span className="slide-commit__text slide-commit__text--error">
            {errorLabel}
          </span>
        </Motion.span>
        <Motion.div
          ref={capsuleRef}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={labelText}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={0}
          aria-busy={phase === "pending" || undefined}
          aria-disabled={disabled || undefined}
          className="slide-commit__capsule"
          style={{
            clipPath: clip,
            transform: shape,
            transformOrigin: origin,
          }}
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse" && finePointer()) setHot(true);
          }}
          onPointerLeave={() => setHot(false)}
          onKeyDown={onKeyDown}
        >
          <Motion.div
            className="slide-commit__content"
            style={{ transform: content }}
          >
            <Motion.span
              className="slide-commit__arrow"
              style={{ opacity: arrow }}
              aria-hidden="true"
            >
              {icon ?? (
                <HugeiconsIcon
                  icon={ArrowRight02Icon}
                  size={iconSize}
                  strokeWidth={2}
                />
              )}
            </Motion.span>
            <Motion.span
              className="slide-commit__spin"
              style={{ opacity: spin }}
              aria-hidden="true"
            >
              <Spinner size={iconSize} />
            </Motion.span>
            <Motion.span
              className="slide-commit__done"
              aria-hidden="true"
              initial={false}
              animate={{
                opacity: done ? 1 : 0,
                scale: done || reduce ? 1 : 0.95,
              }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
            >
              <HugeiconsIcon
                icon={Tick02Icon}
                size={Math.round(gripSize * 0.38)}
                strokeWidth={2.5}
              />
              {doneLabel}
            </Motion.span>
          </Motion.div>
        </Motion.div>
        <span className="slide-commit__sr" aria-live="polite">
          {phase === "pending"
            ? "Working"
            : phase === "done"
              ? doneLabel
              : phase === "error"
                ? errorLabel
                : ""}
        </span>
      </Motion.div>
    </div>
  );
}

export default SlideCommit;
