import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Clock,
  Hospital,
  Stethoscope,
  Activity,
  FlaskConical,
  Pill,
  FileText,
  Scan,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Layers,
  HeartPulse,
  UserCheck,
  Play,
  Pause,
  RotateCcw,
  Gauge
} from 'lucide-react';
import { TimelineEvent, Patient, MedicalDocument } from '../../types/healthcare';

interface LongitudinalWaveTimelineProps {
  patient: Patient;
  timelineEvents: TimelineEvent[];
  documents?: MedicalDocument[];
  onOpenDocumentReview?: (documentId?: string) => void;
}

// Category styling and iconography mapper
const getEventCategoryMeta = (category: string, title: string = '') => {
  const lowerTitle = title.toLowerCase();
  if (
    category === 'Hospital Visit' ||
    lowerTitle.includes('admission') ||
    lowerTitle.includes('hospital') ||
    lowerTitle.includes('ward')
  ) {
    return {
      label: 'Hospital Visit',
      color: '#e11d48', // rose-600
      bg: 'bg-rose-50',
      border: 'border-rose-300',
      text: 'text-rose-700',
      badgeBg: 'bg-rose-100 text-rose-800',
      icon: Hospital,
      waveAmplitude: 48 // crest
    };
  }
  if (
    category === 'Consultation' ||
    lowerTitle.includes('consultation') ||
    lowerTitle.includes('review') ||
    lowerTitle.includes('evaluation')
  ) {
    return {
      label: 'Doctor Consultation',
      color: '#0d9488', // teal-600
      bg: 'bg-teal-50',
      border: 'border-teal-300',
      text: 'text-teal-700',
      badgeBg: 'bg-teal-100 text-teal-800',
      icon: Stethoscope,
      waveAmplitude: -38 // trough
    };
  }
  if (
    category === 'Lab Result' ||
    lowerTitle.includes('lab') ||
    lowerTitle.includes('panel') ||
    lowerTitle.includes('blood') ||
    lowerTitle.includes('metabolic')
  ) {
    return {
      label: 'Lab Test',
      color: '#0284c7', // sky-600
      bg: 'bg-sky-50',
      border: 'border-sky-300',
      text: 'text-sky-700',
      badgeBg: 'bg-sky-100 text-sky-800',
      icon: FlaskConical,
      waveAmplitude: 40
    };
  }
  if (
    category === 'Prescription' ||
    category === 'Medication Update' ||
    lowerTitle.includes('medication') ||
    lowerTitle.includes('prescription')
  ) {
    return {
      label: 'Medications',
      color: '#059669', // emerald-600
      bg: 'bg-emerald-50',
      border: 'border-emerald-300',
      text: 'text-emerald-700',
      badgeBg: 'bg-emerald-100 text-emerald-800',
      icon: Pill,
      waveAmplitude: -42
    };
  }
  if (
    lowerTitle.includes('scan') ||
    lowerTitle.includes('ultrasound') ||
    lowerTitle.includes('x-ray') ||
    lowerTitle.includes('imaging') ||
    lowerTitle.includes('ecg')
  ) {
    return {
      label: 'Scans & Imaging',
      color: '#7c3aed', // violet-600
      bg: 'bg-violet-50',
      border: 'border-violet-300',
      text: 'text-violet-700',
      badgeBg: 'bg-violet-100 text-violet-800',
      icon: Scan,
      waveAmplitude: 36
    };
  }
  return {
    label: category || 'Medical Report',
    color: '#475569', // slate-600
    bg: 'bg-slate-50',
    border: 'border-slate-300',
    text: 'text-slate-700',
    badgeBg: 'bg-slate-100 text-slate-800',
    icon: FileText,
    waveAmplitude: -32
  };
};

export const LongitudinalWaveTimeline: React.FC<LongitudinalWaveTimelineProps> = ({
  patient,
  timelineEvents,
  documents = [],
  onOpenDocumentReview
}) => {
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('ALL');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Animation speed control (0.5x, 1x, 1.5x)
  const [animationSpeed, setAnimationSpeed] = useState<number>(1.0);

  // Is wave actively running or stabilized/paused
  const [isRunning, setIsRunning] = useState<boolean>(true);

  // Selected event on the wave (when tapped, wave pauses & stabilizes on that point)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Filter events for this patient and sort chronologically (oldest to newest for horizontal wave timeline)
  const patientEvents = useMemo(() => {
    return timelineEvents
      .filter((e) => e.patientId === patient.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(a.date).getTime());
  }, [timelineEvents, patient.id]);

  // Available years from events
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    patientEvents.forEach((e) => {
      if (e.year) years.add(e.year);
    });
    [2024, 2025, 2026].forEach((y) => years.add(y));
    return Array.from(years).sort((a, b) => b - a); // 2026, 2025, 2024
  }, [patientEvents]);

  // Filtered timeline events according to active controls
  const filteredEvents = useMemo(() => {
    return patientEvents.filter((evt) => {
      if (selectedYearFilter !== 'ALL' && String(evt.year) !== selectedYearFilter) return false;
      if (selectedMonthFilter !== 'ALL' && evt.month !== selectedMonthFilter) return false;
      if (selectedCategoryFilter !== 'ALL') {
        const meta = getEventCategoryMeta(evt.category, evt.title);
        if (meta.label !== selectedCategoryFilter && evt.category !== selectedCategoryFilter) return false;
      }
      return true;
    });
  }, [patientEvents, selectedYearFilter, selectedMonthFilter, selectedCategoryFilter]);

  // Selected event object
  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null;
    return patientEvents.find((e) => e.id === selectedEventId) || null;
  }, [patientEvents, selectedEventId]);

  // Associated medical report document if attached
  const attachedDocument = useMemo(() => {
    if (!selectedEvent?.documentId) return null;
    return documents.find((d) => d.id === selectedEvent.documentId) || null;
  }, [selectedEvent, documents]);

  // Container refs for responsive dimensions & animation canvas
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesOverlayRef = useRef<HTMLDivElement>(null);

  // Node DOM elements for high-performance direct transform manipulation
  const nodeElementsRef = useRef<Record<string, HTMLDivElement | null>>({});

  // Animation state refs (preserves continuous motion without React state thrashing)
  const offsetRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const sweepXRef = useRef<number>(0);
  const isRunningRef = useRef<boolean>(true);
  const speedRef = useRef<number>(1.0);
  const selectedEventIdRef = useRef<string | null>(null);

  // Keep refs in sync with React state
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    speedRef.current = animationSpeed;
  }, [animationSpeed]);

  useEffect(() => {
    selectedEventIdRef.current = selectedEventId;
  }, [selectedEventId]);

  // Dimensions state
  const [viewportWidth, setViewportWidth] = useState<number>(900);
  const svgHeight = 320;
  const centerY = 160;

  // Spacing between events along the continuous running wave
  const nodeSpacing = 220;

  // Total loop cycle width: minimum width or event count * spacing
  const cycleWidth = useMemo(() => {
    const minWidth = Math.max(viewportWidth + 240, 960);
    const calculated = Math.max(filteredEvents.length * nodeSpacing, minWidth);
    return calculated;
  }, [filteredEvents.length, viewportWidth, nodeSpacing]);

  // Update viewport width on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setViewportWidth(containerRef.current.clientWidth);
      }
    };
    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Handler: Tap event point -> Stabilize point and pause wave
  const handleSelectEvent = (eventId: string) => {
    if (selectedEventId === eventId && !isRunning) {
      // Tapping already selected point closes details and resumes
      handleCloseDetail();
      return;
    }
    setSelectedEventId(eventId);
    setIsRunning(false); // Pause/stabilize wave animation
  };

  // Handler: Close details -> Wave animation continues running
  const handleCloseDetail = () => {
    setSelectedEventId(null);
    setIsRunning(true); // Wave animation continues running
  };

  // Handler: Toggle play/pause manually
  const handleTogglePlayPause = () => {
    setIsRunning((prev) => !prev);
  };

  // Handler: Reset position
  const handleResetWave = () => {
    offsetRef.current = 0;
    timeRef.current = 0;
    sweepXRef.current = 0;
    if (!isRunning) {
      setIsRunning(true);
      setSelectedEventId(null);
    }
  };

  // Compute organic medical wave elevation at any screen position X
  const getWaveElevation = useCallback(
    (x: number, t: number, offset: number, currentCycleWidth: number) => {
      // Continuous moving wave: world coordinate
      const worldX = (x + offset) % currentCycleWidth;

      // 1. Organic multi-harmonic biological baseline wave (smooth, continuous undulating curve)
      const primaryOscillation = Math.sin((worldX / 140) * Math.PI - t * 2.2) * 22;
      const secondaryHarmonic = Math.sin((worldX / 75) * Math.PI + t * 1.4) * 12;
      const slowRhythm = Math.cos((worldX / 260) * Math.PI - t * 0.9) * 10;
      let elevation = primaryOscillation + secondaryHarmonic + slowRhythm;

      // 2. ECG-style heartbeat deflection & milestone crests near historical event points
      filteredEvents.forEach((evt, idx) => {
        const meta = getEventCategoryMeta(evt.category, evt.title);
        // Base X position of this event in the current cycle
        const eventBaseX = idx * nodeSpacing + 120;
        // Screen X position of this event node
        let nodeScreenX = (eventBaseX - offset) % currentCycleWidth;
        if (nodeScreenX < 0) nodeScreenX += currentCycleWidth;

        // Distance from current pixel X to this event node
        const dx = x - nodeScreenX;

        if (Math.abs(dx) < 65) {
          // Authentic ECG QRS-complex deflection
          const qrs =
            -10 * Math.exp(-Math.pow((dx + 16) / 7, 2)) + // Q-wave dip
            38 * Math.exp(-Math.pow(dx / 8, 2)) + // R-wave sharp peak
            -14 * Math.exp(-Math.pow((dx - 14) / 7, 2)); // S-wave dip

          // Smooth Gaussian blending envelope
          const blend = Math.exp(-Math.pow(dx / 32, 2));
          const categoryTilt = (meta.waveAmplitude * 0.4) * blend;

          elevation += (qrs + categoryTilt) * blend;
        }
      });

      return elevation;
    },
    [filteredEvents, nodeSpacing]
  );

  // Main high-performance Animation Loop (Continuous Running Wave via 60fps rAF)
  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp = performance.now();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = (now: number) => {
      const deltaTime = Math.min((now - lastTimestamp) / 1000, 0.08); // cap max delta
      lastTimestamp = now;

      // If running, advance wave offset, sweep line, and time
      if (isRunningRef.current) {
        const speed = speedRef.current;
        // Continuous horizontal wave flow speed (pixels per second)
        const flowSpeed = 52 * speed;
        offsetRef.current = (offsetRef.current + flowSpeed * deltaTime) % cycleWidth;
        timeRef.current += deltaTime * speed;

        // Continuous medical telemetry sweep line moving across the monitor screen
        sweepXRef.current = (sweepXRef.current + 210 * speed * deltaTime) % viewportWidth;
      }

      const offset = offsetRef.current;
      const t = timeRef.current;
      const sweepX = sweepXRef.current;

      // Setup Canvas with devicePixelRatio for crisp medical rendering on high-DPI displays
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = viewportWidth;
      const displayHeight = svgHeight;

      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      // --- 1. Medical Oscilloscope / Telemetry Background Grid ---
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 1;

      // Vertical grid lines
      for (let gx = 0; gx < displayWidth; gx += 40) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, displayHeight);
        ctx.stroke();
      }

      // Horizontal grid lines
      for (let gy = 0; gy < displayHeight; gy += 40) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(displayWidth, gy);
        ctx.stroke();
      }

      // Center Baseline Axis (dashed medical zero-line)
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(displayWidth, centerY);
      ctx.stroke();
      ctx.restore();

      // Clinical Telemetry 1mV Calibration Mark at left border
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(18, centerY);
      ctx.lineTo(26, centerY);
      ctx.lineTo(26, centerY - 28);
      ctx.lineTo(38, centerY - 28);
      ctx.lineTo(38, centerY);
      ctx.lineTo(46, centerY);
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillText('1mV / 25mm/s', 14, centerY + 18);

      // --- 2. Calculate Continuous Organic Wave Path Points ---
      const step = 6; // sampling resolution (smooth 60fps)
      const numPoints = Math.ceil(displayWidth / step) + 1;
      const wavePoints: { x: number; y: number }[] = [];

      for (let i = 0; i <= numPoints; i++) {
        const x = i * step;
        const elevation = getWaveElevation(x, t, offset, cycleWidth);
        const y = Math.min(Math.max(centerY - elevation, 45), displayHeight - 45);
        wavePoints.push({ x, y });
      }

      // --- 3. Translucent Gradient Area Under the Wave ---
      if (wavePoints.length > 0) {
        const areaGrad = ctx.createLinearGradient(0, 0, 0, displayHeight);
        areaGrad.addColorStop(0, 'rgba(13, 148, 136, 0.16)'); // teal-600
        areaGrad.addColorStop(0.5, 'rgba(2, 132, 199, 0.08)'); // sky-600
        areaGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.beginPath();
        ctx.moveTo(wavePoints[0].x, displayHeight);
        ctx.lineTo(wavePoints[0].x, wavePoints[0].y);

        for (let i = 1; i < wavePoints.length; i++) {
          ctx.lineTo(wavePoints[i].x, wavePoints[i].y);
        }

        ctx.lineTo(displayWidth, displayHeight);
        ctx.closePath();
        ctx.fillStyle = areaGrad;
        ctx.fill();
      }

      // --- 4. Continuous Running Wave Stroke (Vibrant Multi-Stop Medical Gradient) ---
      if (wavePoints.length > 0) {
        const strokeGrad = ctx.createLinearGradient(0, 0, displayWidth, 0);
        strokeGrad.addColorStop(0, '#0d9488'); // teal-600
        strokeGrad.addColorStop(0.35, '#0284c7'); // sky-600
        strokeGrad.addColorStop(0.7, '#059669'); // emerald-600
        strokeGrad.addColorStop(1, '#e11d48'); // rose-600

        ctx.beginPath();
        ctx.moveTo(wavePoints[0].x, wavePoints[0].y);

        for (let i = 1; i < wavePoints.length; i++) {
          ctx.lineTo(wavePoints[i].x, wavePoints[i].y);
        }

        ctx.strokeStyle = strokeGrad;
        ctx.lineWidth = 3.2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = 'rgba(13, 148, 136, 0.35)';
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.shadowBlur = 0; // reset
      }

      // --- 5. Medical Sweep Line / Telemetry Wave Scanner ---
      if (isRunningRef.current) {
        // Glowing vertical scanning gradient beam
        const sweepGrad = ctx.createLinearGradient(sweepX - 35, 0, sweepX + 15, 0);
        sweepGrad.addColorStop(0, 'rgba(13, 148, 136, 0)');
        sweepGrad.addColorStop(0.8, 'rgba(13, 148, 136, 0.12)');
        sweepGrad.addColorStop(1, 'rgba(13, 148, 136, 0.45)');

        ctx.fillStyle = sweepGrad;
        ctx.fillRect(Math.max(0, sweepX - 35), 0, 45, displayHeight);

        // Leading edge bright trace line
        ctx.strokeStyle = '#0d9488';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sweepX, 0);
        ctx.lineTo(sweepX, displayHeight);
        ctx.stroke();

        // Glowing sweep beacon at the waveform intersection
        const sweepElevation = getWaveElevation(sweepX, t, offset, cycleWidth);
        const sweepY = Math.min(Math.max(centerY - sweepElevation, 45), displayHeight - 45);

        ctx.beginPath();
        ctx.arc(sweepX, sweepY, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#0f766e';
        ctx.shadowColor = '#14b8a6';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.restore();

      // --- 6. Update Interactive Event Milestone Nodes Position & Pulse Highlight ---
      filteredEvents.forEach((evt, idx) => {
        const nodeEl = nodeElementsRef.current[evt.id];
        if (!nodeEl) return;

        const eventBaseX = idx * nodeSpacing + 120;
        let screenX = (eventBaseX - offset) % cycleWidth;
        if (screenX < 0) screenX += cycleWidth;

        const elevation = getWaveElevation(screenX, t, offset, cycleWidth);
        const screenY = Math.min(Math.max(centerY - elevation, 55), displayHeight - 55);

        // Edge Opacity Feathering (Ensures continuous smooth looping with NO visible jumps or resets)
        const edgeFadeMargin = 75;
        let edgeOpacity = 1;
        if (screenX < edgeFadeMargin) {
          edgeOpacity = Math.max(0, screenX / edgeFadeMargin);
        } else if (screenX > displayWidth - edgeFadeMargin) {
          edgeOpacity = Math.max(0, (displayWidth - screenX) / edgeFadeMargin);
        }

        // Pulse / Highlight when the animation sweep reaches this event point
        const distToSweep = Math.abs(screenX - sweepX);
        const isNearSweep = distToSweep < 45 && isRunningRef.current;
        const isSelected = selectedEventIdRef.current === evt.id;

        // Apply direct CSS Transform for frictionless 60fps rendering without React re-render overhead
        nodeEl.style.transform = `translate3d(${screenX}px, ${screenY}px, 0) translate(-50%, -50%)`;
        nodeEl.style.opacity = String(edgeOpacity);
        nodeEl.style.pointerEvents = edgeOpacity < 0.2 ? 'none' : 'auto';

        // Toggle gentle pulse highlight ring when animation reaches event point
        const pulseRing = nodeEl.querySelector('.event-sweep-pulse') as HTMLElement | null;
        if (pulseRing) {
          if (isNearSweep) {
            pulseRing.style.opacity = '0.7';
            pulseRing.style.transform = 'scale(1.45)';
          } else {
            pulseRing.style.opacity = '0';
            pulseRing.style.transform = 'scale(0.85)';
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [cycleWidth, viewportWidth, filteredEvents, getWaveElevation]);

  // Jump to specific year: centers the view near that year's first event
  const handleScrollToYear = (year: number | string) => {
    if (year === 'ALL') {
      setSelectedYearFilter('ALL');
      return;
    }
    setSelectedYearFilter(String(year));
    const targetIdx = filteredEvents.findIndex((e) => String(e.year) === String(year));
    if (targetIdx !== -1) {
      const targetBaseX = targetIdx * nodeSpacing + 120;
      offsetRef.current = (targetBaseX - viewportWidth / 2 + cycleWidth) % cycleWidth;
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 1. Header & Live Waveform Controls Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-2xs shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Previous Longitudinal Health History
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center space-x-1.5 transition-colors ${
                    isRunning
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  <span>{isRunning ? 'Continuous Running Waveform' : 'Point Stabilized'}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Continuous running medical waveform graph. Tap any historical event point to stabilize and inspect existing clinical records.
              </p>
            </div>
          </div>

          {/* Continuous Waveform Interactive Controls (Play/Pause, Speed, Reset) */}
          <div className="flex items-center flex-wrap gap-2 self-start sm:self-auto">
            {/* Play / Pause Toggle */}
            <button
              onClick={handleTogglePlayPause}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 border transition-all shadow-2xs ${
                isRunning
                  ? 'bg-slate-900 text-white border-slate-800 hover:bg-slate-800'
                  : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 animate-bounce'
              }`}
              title={isRunning ? 'Pause Wave' : 'Resume Live Running Wave'}
            >
              {isRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Wave</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume Live Wave</span>
                </>
              )}
            </button>

            {/* Speed Selector (0.5x, 1x, 1.5x) */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
              <span className="text-slate-400 px-1 text-[10px]">Speed:</span>
              {[0.5, 1.0, 1.5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setAnimationSpeed(spd)}
                  className={`px-2 py-0.5 rounded-lg transition-all ${
                    animationSpeed === spd
                      ? 'bg-white text-teal-800 shadow-2xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Reset Loop Button */}
            <button
              onClick={handleResetWave}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
              title="Reset Waveform Loop Position"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filter Controls: Years, Event Category, and Month */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
          {/* Quick Year Jump Buttons */}
          <div className="flex items-center space-x-1 overflow-x-auto py-0.5">
            <span className="text-slate-400 text-[11px] font-semibold mr-1 shrink-0">Year:</span>
            {['ALL', '2026', '2025', '2024'].map((yr) => (
              <button
                key={yr}
                onClick={() => handleScrollToYear(yr)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                  selectedYearFilter === yr
                    ? 'bg-teal-700 text-white shadow-2xs scale-105'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-1 overflow-x-auto py-0.5 scrollbar-none">
            <span className="text-slate-400 text-[11px] font-semibold mr-1 shrink-0">Category:</span>
            {[
              { label: 'ALL', name: 'All Events' },
              { label: 'Hospital Visit', name: 'Hospital Visits' },
              { label: 'Doctor Consultation', name: 'Consultations' },
              { label: 'Lab Test', name: 'Lab Tests' },
              { label: 'Medications', name: 'Medications' },
              { label: 'Scans & Imaging', name: 'Scans' }
            ].map((cat) => (
              <button
                key={cat.label}
                onClick={() => setSelectedCategoryFilter(cat.label)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  selectedCategoryFilter === cat.label
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Month Dropdown */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-500 font-medium">Month:</span>
            <select
              value={selectedMonthFilter}
              onChange={(e) => setSelectedMonthFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer text-xs"
            >
              <option value="ALL">All Months</option>
              {[
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December'
              ].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Continuous Running Waveform Stage */}
      <div
        ref={containerRef}
        className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden relative select-none"
      >
        {/* Top Wave Info & Live Status Banner */}
        <div className="p-3.5 bg-slate-50/80 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isRunning ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'
              }`}
            />
            <span className="text-slate-700 font-semibold">
              {isRunning ? (
                <span>
                  ECG-style wave actively running. <strong className="text-slate-900">Tap any historical event point</strong> to pause & stabilize it.
                </span>
              ) : (
                <span className="text-amber-800 font-bold flex items-center">
                  <Pause className="w-3.5 h-3.5 mr-1" />
                  Waveform Stabilized on Selected Point — Tap &quot;Resume Live Wave&quot; or close details to continue running.
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-slate-500 text-[11px] font-mono">
            <span>Loop: {filteredEvents.length} Historical Milestones</span>
            <span>•</span>
            <span>Speed: {animationSpeed}x</span>
          </div>
        </div>

        {/* Viewport for Continuous Wave Animation & Interactive Nodes */}
        <div
          className="relative overflow-hidden w-full"
          style={{ height: `${svgHeight}px`, minHeight: '320px' }}
        >
          {/* Continuous Hardware-Accelerated Waveform Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ width: '100%', height: '100%' }}
          />

          {/* Edge Opacity Masks for seamless visual fading into boundaries */}
          <div
            className="absolute top-0 bottom-0 left-0 w-16 pointer-events-none z-10"
            style={{
              background: 'linear-gradient(to right, rgba(255,255,255,0.95), rgba(255,255,255,0))'
            }}
          />
          <div
            className="absolute top-0 bottom-0 right-0 w-16 pointer-events-none z-10"
            style={{
              background: 'linear-gradient(to left, rgba(255,255,255,0.95), rgba(255,255,255,0))'
            }}
          />

          {/* Interactive Milestone Nodes Layer along the running wave */}
          <div ref={nodesOverlayRef} className="absolute inset-0 pointer-events-none">
            {filteredEvents.map((evt) => {
              const meta = getEventCategoryMeta(evt.category, evt.title);
              const isSelected = selectedEventId === evt.id;
              const IconComponent = meta.icon;
              const is2026 = evt.year === 2026;
              const isHospitalVisit = meta.label === 'Hospital Visit';

              return (
                <div
                  key={evt.id}
                  ref={(el) => {
                    nodeElementsRef.current[evt.id] = el;
                  }}
                  onClick={() => handleSelectEvent(evt.id)}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    zIndex: isSelected ? 40 : 25,
                    willChange: 'transform, opacity'
                  }}
                  className="group cursor-pointer pointer-events-auto touch-manipulation select-none"
                >
                  {/* Sweep Detection Pulse Ring (gently pulses when running animation sweep reaches this point) */}
                  <div
                    className="event-sweep-pulse absolute inset-[-14px] rounded-full pointer-events-none transition-all duration-300 ease-out"
                    style={{
                      backgroundColor: meta.color,
                      opacity: 0,
                      transform: 'scale(0.85)'
                    }}
                  />

                  {/* Active Stabilized Target Ring when Selected */}
                  {isSelected && (
                    <>
                      <div
                        className="absolute inset-[-18px] rounded-full animate-ping opacity-40 pointer-events-none"
                        style={{ backgroundColor: meta.color }}
                      />
                      <div
                        className="absolute inset-[-10px] rounded-full border-2 border-dashed pointer-events-none animate-spin"
                        style={{ borderColor: meta.color, animationDuration: '8s' }}
                      />
                    </>
                  )}

                  {/* Node Button with Lucide Icon */}
                  <div
                    style={{
                      backgroundColor: isSelected ? meta.color : '#ffffff',
                      borderColor: meta.color,
                      boxShadow: isSelected
                        ? `0 0 0 4px #ffffff, 0 0 0 7px ${meta.color}, 0 10px 24px rgba(0,0,0,0.22)`
                        : '0 2px 8px rgba(0,0,0,0.12)'
                    }}
                    className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center transition-transform hover:scale-115 active:scale-95 ${
                      isSelected ? 'scale-120' : ''
                    }`}
                  >
                    <IconComponent
                      className={`w-5 h-5 transition-colors ${
                        isSelected ? 'text-white' : meta.text
                      }`}
                    />
                  </div>

                  {/* Marker Tag badge above/below the node */}
                  <div className="absolute left-1/2 -translate-x-1/2 -top-10 whitespace-nowrap pointer-events-none transition-transform group-hover:scale-105">
                    <div
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold shadow-2xs border flex items-center space-x-1 ${
                        isSelected
                          ? 'bg-slate-950 text-white border-slate-800 scale-105 shadow-md'
                          : is2026
                          ? 'bg-white text-slate-900 border-rose-300 font-extrabold'
                          : 'bg-white/95 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="font-mono">{evt.year}</span>
                      <span>•</span>
                      <span className="truncate max-w-[100px]">{meta.label}</span>
                      {isHospitalVisit && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Helper Bar */}
        <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-slate-600">
            <span className="inline-block w-2 h-2 rounded-full bg-teal-500" />
            <span className="text-[11px]">
              Tap any point to pause & inspect details. Close details or tap &quot;Resume Live Wave&quot; to continue running.
            </span>
          </div>

          <div className="text-slate-500 text-[11px]">
            Showing <strong className="text-slate-800">{filteredEvents.length}</strong> patient events along the moving waveform
          </div>
        </div>
      </div>

      {/* 3. Detail Pop-up / Card for Selected Wave Event */}
      <AnimatePresence mode="wait">
        {selectedEvent && (
          <motion.div
            key={selectedEvent.id}
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="bg-white rounded-3xl border-2 border-teal-600 shadow-lg p-5 sm:p-6 space-y-4 relative overflow-hidden"
          >
            {/* Top Accent Strip with Wave Node Category Color */}
            <div
              className="absolute top-0 left-0 right-0 h-1.5"
              style={{
                backgroundColor: getEventCategoryMeta(selectedEvent.category, selectedEvent.title).color
              }}
            />

            {/* Event Header & Action Close */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pt-1">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-slate-900 text-white">
                    {selectedEvent.year} — {selectedEvent.category}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    {selectedEvent.date} ({selectedEvent.month})
                  </span>
                  {selectedEvent.year === 2026 && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center">
                      <Sparkles className="w-3 h-3 mr-1 text-rose-600" />
                      Recent 2026 Milestone
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center">
                    <Pause className="w-2.5 h-2.5 mr-1" />
                    Waveform Stabilized
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center">
                  {selectedEvent.title}
                </h3>
              </div>

              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-start">
                {selectedEvent.documentId && onOpenDocumentReview && (
                  <button
                    onClick={() => onOpenDocumentReview(selectedEvent.documentId)}
                    className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center space-x-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-teal-700" />
                    <span>View Attached Report</span>
                  </button>
                )}

                {/* Resume Wave Button */}
                <button
                  onClick={handleCloseDetail}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-2xs"
                  title="Close and resume running wave"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Resume Wave</span>
                </button>

                {/* Close 'X' Button */}
                <button
                  onClick={handleCloseDetail}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                  title="Close Details"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Exact Required Clinical Summary Card Format:
                [Year] — [Category / Hospital Visit]
                Hospital: [Existing Data]
                Date: [Existing Data]
                Diagnosis: [Existing Data]
                Reports: [Existing Data]
            */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                <span className="font-bold text-slate-900 text-sm font-mono">
                  {selectedEvent.year} — {selectedEvent.category}
                </span>
                <span className="text-slate-500 text-[11px] font-medium">
                  Encounter ID: #{selectedEvent.id}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-bold text-slate-500 mr-2">Hospital:</span>
                  <strong className="text-slate-900">{selectedEvent.facility}</strong>
                </div>

                <div>
                  <span className="font-bold text-slate-500 mr-2">Date:</span>
                  <strong className="text-slate-900 font-mono">
                    {selectedEvent.date} ({selectedEvent.month})
                  </strong>
                </div>

                <div className="sm:col-span-2">
                  <span className="font-bold text-slate-500 mr-2">Diagnosis:</span>
                  {selectedEvent.details.diagnoses && selectedEvent.details.diagnoses.length > 0 ? (
                    <strong className="text-teal-900">
                      {selectedEvent.details.diagnoses.join(', ')}
                    </strong>
                  ) : (
                    <span className="text-slate-500 italic">No specific diagnosis recorded</span>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <span className="font-bold text-slate-500 mr-2">Reports:</span>
                  {attachedDocument ? (
                    <strong className="text-sky-900">
                      {attachedDocument.title} ({attachedDocument.fileFormat}, {attachedDocument.fileSize})
                    </strong>
                  ) : selectedEvent.documentId ? (
                    <strong className="text-slate-800">
                      Medical Document #{selectedEvent.documentId} (Archived)
                    </strong>
                  ) : (
                    <span className="text-slate-700">{selectedEvent.summary}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Detailed Clinical Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Diagnoses & Prescriptions */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block flex items-center">
                  <Activity className="w-3.5 h-3.5 mr-1 text-teal-600" />
                  Clinical Diagnoses & Treatment:
                </span>
                {selectedEvent.details.diagnoses && selectedEvent.details.diagnoses.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedEvent.details.diagnoses.map((d) => (
                      <span
                        key={d}
                        className="px-2.5 py-1 bg-teal-50 text-teal-900 border border-teal-200 rounded-lg font-semibold text-xs"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No specific diagnosis recorded during this encounter.</p>
                )}

                {/* Prescriptions */}
                {selectedEvent.details.prescribedMeds && selectedEvent.details.prescribedMeds.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 flex items-center">
                      <Pill className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      Prescribed Regimens:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedEvent.details.prescribedMeds.map((m) => (
                        <span
                          key={m}
                          className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-mono text-[11px]"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Lab Values & Attending Physician */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block flex items-center">
                    <FlaskConical className="w-3.5 h-3.5 mr-1 text-teal-600" />
                    Laboratory Values & Clinician:
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Dr. {selectedEvent.doctorName}
                  </span>
                </div>

                {selectedEvent.details.labValues && selectedEvent.details.labValues.length > 0 ? (
                  <div className="grid grid-cols-2 gap-1.5">
                    {selectedEvent.details.labValues.slice(0, 4).map((lab) => (
                      <div
                        key={lab.parameter}
                        className="p-1.5 bg-slate-50 rounded border border-slate-200 text-[11px] flex justify-between"
                      >
                        <span className="text-slate-600 truncate mr-1">{lab.parameter}:</span>
                        <span className="font-mono font-bold text-slate-900">{lab.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No specific lab measurements recorded.</p>
                )}

                {/* Clinician Notes */}
                {selectedEvent.details.notes && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-amber-800 block mb-0.5">
                      Clinician Notes:
                    </span>
                    <p className="text-[11px] text-slate-700">{selectedEvent.details.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

