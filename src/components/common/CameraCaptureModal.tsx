import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera,
  RotateCw,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  SwitchCamera,
  Scan,
  ShieldAlert,
  Sparkles,
  Maximize2
} from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File, dataUrl: string) => void;
  title?: string;
  subtitle?: string;
}

export function dataURLtoFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime, lastModified: Date.now() });
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Scan Medical Document with Camera',
  subtitle = 'Align prescriptions, lab reports, or discharge summaries within the frame'
}) => {
  const [status, setStatus] = useState<'STARTING' | 'STREAMING' | 'PREVIEW' | 'ERROR'>('STARTING');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [errorDetail, setErrorDetail] = useState<string>('');
  const [errorType, setErrorType] = useState<'PERMISSION' | 'NOT_FOUND' | 'IN_USE' | 'UNSUPPORTED' | 'GENERIC'>('GENERIC');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isShutterActive, setIsShutterActive] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const checkMultipleCameras = useCallback(async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
      }
    } catch {
      // Ignore
    }
  }, []);

  const startCamera = useCallback(
    async (preferredMode: 'environment' | 'user' = facingMode) => {
      stopStream();
      setStatus('STARTING');
      setErrorMessage('');
      setErrorDetail('');

      if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setStatus('ERROR');
        setErrorType('UNSUPPORTED');
        setErrorMessage('Camera Access Not Supported');
        setErrorDetail(
          'Your browser does not support the MediaDevices getUserMedia camera API, or this application is running in an insecure (non-HTTPS) context.'
        );
        return;
      }

      try {
        let stream: MediaStream;
        try {
          // Attempt high-resolution with desired facing mode (rear camera prioritized for documents)
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: preferredMode },
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            },
            audio: false
          });
        } catch (constraintErr: any) {
          // Fallback to unconstrained video stream if ideal facingMode/resolution rejected
          console.warn('Initial camera constraints failed, attempting fallback:', constraintErr);
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch (playErr) {
            console.warn('Video play interrupted:', playErr);
          }
        }
        setStatus('STREAMING');
        checkMultipleCameras();
      } catch (err: any) {
        console.error('Camera access error:', err);
        setStatus('ERROR');

        const errName = err.name || '';
        if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
          setErrorType('PERMISSION');
          setErrorMessage('Camera Permission Denied');
          setErrorDetail(
            'Camera access was blocked by your browser or system. Please click the camera icon in your browser address bar to grant permission and retry.'
          );
        } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
          setErrorType('NOT_FOUND');
          setErrorMessage('No Camera Hardware Found');
          setErrorDetail(
            'No physical camera or webcam was detected on this device. Please connect a webcam or access this platform from a mobile phone.'
          );
        } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
          setErrorType('IN_USE');
          setErrorMessage('Camera In Use by Another App');
          setErrorDetail(
            'The camera could not be started because another application, browser tab, or background process is currently holding the camera lock.'
          );
        } else {
          setErrorType('GENERIC');
          setErrorMessage('Unable to Initialize Camera');
          setErrorDetail(err.message || 'An unexpected error occurred while connecting to the video capture stream.');
        }
      }
    },
    [facingMode, stopStream, checkMultipleCameras]
  );

  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      startCamera(facingMode);
    } else {
      stopStream();
      setStatus('STARTING');
      setCapturedImage(null);
    }

    return () => {
      stopStream();
    };
  }, [isOpen]);

  const handleFlipCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    setIsShutterActive(true);
    setTimeout(() => setIsShutterActive(false), 200);

    const canvas = document.createElement('canvas');
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedImage(dataUrl);
      stopStream();
      setStatus('PREVIEW');
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  const handleUsePhoto = () => {
    if (!capturedImage) return;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const filename = `medical_scan_${dateStr}_${timeStr}.jpg`;

    const file = dataURLtoFile(capturedImage, filename);
    onCapture(file, capturedImage);
    stopStream();
    onClose();
  };

  const handleClose = () => {
    stopStream();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="camera-capture-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="camera-modal-title"
    >
      <div
        id="camera-capture-modal-container"
        className="bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl max-w-3xl w-full flex flex-col shadow-2xl overflow-hidden text-white my-auto max-h-[95vh]"
      >
        {/* Modal Header */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 id="camera-modal-title" className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                {title}
                {status === 'STREAMING' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
                    LIVE
                  </span>
                )}
                {status === 'PREVIEW' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    PREVIEW
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 hidden sm:block mt-0.5">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {status === 'STREAMING' && hasMultipleCameras && (
              <button
                id="camera-flip-btn"
                type="button"
                onClick={handleFlipCamera}
                title="Flip Camera (Front / Rear)"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>
            )}
            <button
              id="camera-modal-close-btn"
              type="button"
              onClick={handleClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close camera modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport Body */}
        <div className="relative bg-black flex-1 min-h-[320px] sm:min-h-[440px] max-h-[65vh] flex items-center justify-center overflow-hidden">
          {/* Shutter effect flash */}
          {isShutterActive && (
            <div className="absolute inset-0 bg-white/80 z-30 pointer-events-none transition-opacity duration-150" />
          )}

          {/* STREAMING STATE */}
          <div
            className={`w-full h-full flex items-center justify-center ${
              status === 'STREAMING' || status === 'STARTING' ? 'block' : 'hidden'
            }`}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain max-h-[62vh]"
            />

            {/* Document Guide Overlays & Clinical Grid */}
            {status === 'STREAMING' && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6 z-10">
                {/* Outer Framing Bounds */}
                <div className="w-full max-w-xl h-[85%] border-2 border-teal-400/60 rounded-2xl relative shadow-[0_0_20px_rgba(20,184,166,0.25)] flex flex-col justify-between p-3">
                  {/* Four Corner Crosshairs */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-teal-400 rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-teal-400 rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-teal-400 rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-teal-400 rounded-br-lg" />

                  {/* Top Guide Text */}
                  <div className="text-center">
                    <span className="inline-block px-3 py-1 rounded-full text-[11px] font-medium bg-slate-900/80 text-teal-300 border border-teal-500/40 backdrop-blur-xs">
                      Align document edges within the frame
                    </span>
                  </div>

                  {/* Animated Horizontal Scan Beam */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-70 animate-pulse my-auto" />

                  {/* Bottom Guide Text */}
                  <div className="text-center">
                    <span className="inline-block px-3 py-0.5 rounded-full text-[10px] text-slate-300 bg-slate-900/80 backdrop-blur-xs">
                      Hold steady under good lighting
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Starting Indicator */}
            {status === 'STARTING' && (
              <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center space-y-3 z-20">
                <RefreshCw className="w-8 h-8 text-teal-400 animate-spin" />
                <div className="text-sm font-semibold text-slate-200">Requesting device camera access...</div>
                <div className="text-xs text-slate-400 max-w-xs text-center">
                  Please tap "Allow" when your browser prompts for camera permissions.
                </div>
              </div>
            )}
          </div>

          {/* CAPTURED PREVIEW STATE */}
          {status === 'PREVIEW' && capturedImage && (
            <div id="camera-captured-preview-container" className="relative w-full h-full flex items-center justify-center p-3 sm:p-5">
              <img
                id="camera-captured-preview-img"
                src={capturedImage}
                alt="Captured medical document preview"
                className="max-h-[58vh] w-auto max-w-full rounded-xl object-contain border border-slate-700 shadow-xl"
              />
              <div className="absolute top-4 left-4 z-10">
                <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-900/90 text-teal-300 border border-teal-500/40 text-xs font-semibold backdrop-blur-md shadow-lg space-x-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Document Photo Captured</span>
                </div>
              </div>
            </div>
          )}

          {/* ERROR STATE */}
          {status === 'ERROR' && (
            <div id="camera-error-container" className="p-6 text-center max-w-md mx-auto space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                {errorType === 'PERMISSION' ? (
                  <ShieldAlert className="w-7 h-7" />
                ) : (
                  <AlertTriangle className="w-7 h-7" />
                )}
              </div>

              <div>
                <h4 className="text-base font-bold text-white mb-1">{errorMessage}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{errorDetail}</p>
              </div>

              {errorType === 'PERMISSION' && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs text-left space-y-1">
                  <div className="font-semibold text-amber-300">How to enable camera permissions:</div>
                  <ol className="list-decimal list-inside space-y-0.5 text-slate-300 text-[11px]">
                    <li>Click the lock or camera icon in your browser's address bar.</li>
                    <li>Set "Camera" to <strong>Allow</strong>.</li>
                    <li>Click the "Retry Camera" button below or refresh the page.</li>
                  </ol>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  id="camera-retry-btn"
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors flex items-center space-x-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Camera</span>
                </button>
                <button
                  id="camera-cancel-error-btn"
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between shrink-0">
          {/* Footer Left Details */}
          <div className="text-xs text-slate-400">
            {status === 'STREAMING' && (
              <span>Camera active • Tap <strong>Take Photo</strong> to capture</span>
            )}
            {status === 'PREVIEW' && (
              <span className="text-slate-300">Inspect photo clarity before processing</span>
            )}
            {status === 'STARTING' && <span>Initializing optical scanner...</span>}
            {status === 'ERROR' && <span>Camera unavailable</span>}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center space-x-3">
            {/* STREAMING: Take Photo Button */}
            {status === 'STREAMING' && (
              <>
                <button
                  id="camera-cancel-btn"
                  type="button"
                  onClick={handleClose}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  id="camera-take-photo-btn"
                  type="button"
                  onClick={handleCapturePhoto}
                  className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98] flex items-center space-x-2"
                >
                  <Camera className="w-4 h-4 text-slate-950" />
                  <span>Take Photo</span>
                </button>
              </>
            )}

            {/* PREVIEW: Retake and Use Photo Buttons */}
            {status === 'PREVIEW' && (
              <>
                <button
                  id="camera-retake-btn"
                  type="button"
                  onClick={handleRetake}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors border border-slate-700 flex items-center space-x-2"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </button>
                <button
                  id="camera-use-photo-btn"
                  type="button"
                  onClick={handleUsePhoto}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] flex items-center space-x-2"
                >
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>Use Photo</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default CameraCaptureModal;
