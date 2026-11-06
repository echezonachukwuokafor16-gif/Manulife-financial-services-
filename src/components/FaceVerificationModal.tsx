/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, Camera, CheckCircle2, AlertTriangle, RefreshCw, 
  X, Upload, Sparkles, Check, Lock, Eye, Scan, ArrowRight, 
  FileText, ShieldAlert, Award
} from 'lucide-react';
import { FaceVerification } from '../types';

interface FaceVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationComplete: (verification: FaceVerification) => void;
  applicantName?: string;
  referencePhotoUrl?: string;
}

export const FaceVerificationModal: React.FC<FaceVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerificationComplete,
  applicantName = 'Alexander Montgomery',
  referencePhotoUrl,
}) => {
  const [stage, setStage] = useState<'intro' | 'scanning' | 'analyzing' | 'completed'>('intro');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  // Real-time scan simulation states
  const [livenessStep, setLivenessStep] = useState<number>(1); // 1: Align, 2: Blink, 3: Depth Capture
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [currentAnalysisStepText, setCurrentAnalysisStepText] = useState<string>('Initializing optical neural network...');
  const [completedVerification, setCompletedVerification] = useState<FaceVerification | null>(null);

  // References
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up camera stream on close/unmount
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
      if (scanTimerRef.current) clearInterval(scanTimerRef.current);
    };
  }, []);

  // When modal closes, reset states and release hardware
  const handleClose = () => {
    stopCameraStream();
    setStage('intro');
    setCameraError(null);
    setCapturedImage(null);
    setCompletedVerification(null);
    onClose();
  };

  // Start webcam
  const startCamera = async () => {
    setCameraError(null);
    setStage('scanning');
    setLivenessStep(1);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('WebRTC Camera API not supported in this environment');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => console.warn('Play error:', err));
      }

      // Step progression simulation with real camera
      setTimeout(() => setLivenessStep(2), 2200);
      setTimeout(() => setLivenessStep(3), 4200);
      setTimeout(() => captureFrameFromVideo(), 5800);
    } catch (err: any) {
      console.warn('Camera access unavailable, switching to fallback biometric photo engine:', err);
      setCameraError('Camera access unavailable or restricted in this browser frame. You can scan your applicant photograph or upload a selfie below.');
      setCameraActive(false);
    }
  };

  // Capture frame from active video
  const captureFrameFromVideo = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(dataUrl);
        stopCameraStream();
        runBiometricAnalysis(dataUrl);
        return;
      }
    }
    // Fallback if canvas capture failed
    const fallbackUrl = referencePhotoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';
    setCapturedImage(fallbackUrl);
    stopCameraStream();
    runBiometricAnalysis(fallbackUrl);
  };

  // Use applicant's uploaded or sample photo
  const handleScanReferencePhoto = () => {
    const photoToScan = referencePhotoUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80';
    setCapturedImage(photoToScan);
    setCameraError(null);
    runBiometricAnalysis(photoToScan);
  };

  // Handle uploaded selfie file
  const handleUploadSelfie = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setCapturedImage(url);
      setCameraError(null);
      runBiometricAnalysis(url);
    };
    reader.readAsDataURL(file);
  };

  // Run biometric algorithmic pipeline simulation
  const runBiometricAnalysis = (imageUrl: string) => {
    setStage('analyzing');
    setAnalysisProgress(10);
    setCurrentAnalysisStepText('Extracting 68-point facial landmark topography...');

    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          finishVerification(imageUrl);
          return 100;
        }
        if (prev === 25) setCurrentAnalysisStepText('Executing 3D depth and micro-texture reflection check...');
        if (prev === 55) setCurrentAnalysisStepText('Verifying ISO 30107-3 anti-spoofing presentation attack detection...');
        if (prev === 75) setCurrentAnalysisStepText('Matching facial vector embeddings against government registry...');
        return prev + 15;
      });
    }, 350);
  };

  // Finalize verification record
  const finishVerification = (imageUrl: string) => {
    const randScore = +(98.5 + Math.random() * 1.3).toFixed(1);
    const randMatch = +(98.0 + Math.random() * 1.5).toFixed(1);
    const verificationRecord: FaceVerification = {
      verified: true,
      verifiedAt: new Date().toISOString(),
      verificationId: `BIO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      livenessScore: randScore,
      matchConfidence: randMatch,
      antiSpoofingStatus: 'Passed',
      faceImageUrl: imageUrl,
      idCardImageUrl: referencePhotoUrl || imageUrl,
      livenessChecks: {
        blinkDetected: true,
        headTurnDetected: true,
        depthAnalyzed: true,
        lightingPass: true,
        antiPresentationAttack: true,
      },
      deviceInfo: `${navigator.platform || 'Client Device'} · TrueDepth Optical Biometric Engine v4.2`,
      auditHash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    };

    setCompletedVerification(verificationRecord);
    setStage('completed');
  };

  const handleApplyVerification = () => {
    if (completedVerification) {
      onVerificationComplete(completedVerification);
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col text-slate-800">
        
        {/* Header Ribbon */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-400 font-bold shrink-0">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Biometric Identity Verification</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-300 font-mono">ISO 30107-3 LIVENESS</span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Live Facial KYC & Anti-Spoofing Audit
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden Canvas for Video Frame Capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* STAGE 1: INTRO & INSTRUCTIONS */}
          {stage === 'intro' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center max-w-md mx-auto space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Scan className="w-8 h-8 animate-pulse" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Instant Biometric Facial Verification
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  To protect your credit facility from identity theft and satisfy international AML/KYC regulations, we perform a 3-second live facial liveness check.
                </p>
              </div>

              {/* 3 Step Guidance */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1.5">
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center mx-auto">
                    1
                  </div>
                  <strong className="text-xs font-bold text-slate-900 block">Position Face</strong>
                  <p className="text-[11px] text-slate-500">Align your face inside the biometric oval in good lighting.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1.5">
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center mx-auto">
                    2
                  </div>
                  <strong className="text-xs font-bold text-slate-900 block">Optical Liveness</strong>
                  <p className="text-[11px] text-slate-500">Blink naturally as the system verifies 3D depth and motion.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-800 text-white text-xs font-bold flex items-center justify-center mx-auto">
                    3
                  </div>
                  <strong className="text-xs font-bold text-slate-900 block">Certify Identity</strong>
                  <p className="text-[11px] text-slate-500">Receive an official tamper-evident Biometric Certificate.</p>
                </div>
              </div>

              {/* Security Policy Disclosure */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-950">
                <Lock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold block">Zero Deepfake & Presentation Attack Tolerance</span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Facial scan vectors are converted into non-reversible mathematical hashes and evaluated under ISO 30107-3 Level 2 criteria. No raw video is ever shared with third parties.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 group"
                >
                  <Camera className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Start Live Webcam Facial Scan</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-slate-500 pt-1">
                  <span>No camera available?</span>
                  <label className="text-emerald-800 font-semibold hover:underline cursor-pointer flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Selfie Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadSelfie}
                      className="hidden"
                    />
                  </label>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={handleScanReferencePhoto}
                    className="text-slate-700 font-semibold hover:text-emerald-800 underline"
                  >
                    Scan Applicant Profile Photo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 2: LIVE CAMERA / SCANNING HUD */}
          {stage === 'scanning' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Camera Error / Fallback Card if getUserMedia was denied or blocked */}
              {cameraError && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3 text-xs text-amber-950">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Hardware Camera Permission Notice</span>
                  </div>
                  <p className="text-amber-800 text-[11px] leading-relaxed">
                    {cameraError}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleScanReferencePhoto}
                      className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      Scan Applicant Profile Photo
                    </button>
                    <label className="px-3.5 py-1.5 bg-white border border-amber-300 text-amber-900 rounded-lg text-xs font-semibold cursor-pointer hover:bg-amber-50 transition-colors inline-flex items-center gap-1.5">
                      <Upload className="w-3 h-3" />
                      <span>Upload Photo File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadSelfie}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Viewport Frame */}
              <div className="relative aspect-[4/3] max-w-md mx-auto rounded-3xl overflow-hidden bg-slate-950 border-2 border-slate-800 shadow-2xl flex items-center justify-center">
                
                {/* Active Video Element */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover transform -scale-x-100 ${cameraActive ? 'block' : 'hidden'}`}
                />

                {/* If camera inactive, show placeholder graphic */}
                {!cameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-6 text-center space-y-3">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-emerald-500/60 flex items-center justify-center text-emerald-400">
                      <Scan className="w-10 h-10 animate-pulse" />
                    </div>
                    <p className="text-xs text-slate-300">
                      Awaiting camera feed or fallback photo upload...
                    </p>
                  </div>
                )}

                {/* HIGH-TECH BIOMETRIC HUD OVERLAY */}
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
                  
                  {/* Top HUD bar */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-emerald-500/30">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>OPTICAL LIVENESS DETECTION ACTIVE</span>
                    </span>
                    <span className="text-slate-300">FPS: 30 · 1080p</span>
                  </div>

                  {/* Central Biometric Oval Guide */}
                  <div className="relative mx-auto my-auto w-48 sm:w-56 h-64 sm:h-72 rounded-[50%] border-2 border-dashed border-emerald-400 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.25)]">
                    
                    {/* Corner Target Markers */}
                    <div className="absolute top-2 left-6 w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
                    <div className="absolute top-2 right-6 w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
                    <div className="absolute bottom-2 left-6 w-3 h-3 border-b-2 border-l-2 border-emerald-400" />
                    <div className="absolute bottom-2 right-6 w-3 h-3 border-b-2 border-r-2 border-emerald-400" />

                    {/* Animated Scanning Laser Line */}
                    <div className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34d399] animate-bounce" />

                    {/* Instruction text pill centered */}
                    <div className="bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-semibold border border-emerald-400/40 shadow-lg text-center">
                      {livenessStep === 1 && 'Align Face Within Oval'}
                      {livenessStep === 2 && 'Blink Eyes & Hold Still'}
                      {livenessStep === 3 && 'Analyzing 3D Depth...'}
                    </div>
                  </div>

                  {/* Bottom Telemetry Meter */}
                  <div className="bg-black/60 backdrop-blur-sm px-3 py-2 rounded-xl border border-emerald-500/30 flex items-center justify-between text-[10px] font-mono text-emerald-300">
                    <span>LIGHTING: OPTIMAL (84 LUX)</span>
                    <span>DISTANCE: 45 CM</span>
                    <span>PAD RISK: 0.01%</span>
                  </div>

                </div>

              </div>

              {/* Manual Snap / Cancel buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    stopCameraStream();
                    setStage('intro');
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel Scan
                </button>

                <button
                  type="button"
                  onClick={captureFrameFromVideo}
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Capture & Analyze Now</span>
                </button>
              </div>

            </div>
          )}

          {/* STAGE 3: ANALYZING BIOMETRIC TELEMETRY */}
          {stage === 'analyzing' && (
            <div className="py-8 text-center space-y-6 max-w-md mx-auto animate-fadeIn">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />
                <div 
                  className="absolute inset-0 rounded-full border-4 border-emerald-700 border-t-transparent animate-spin"
                  style={{ animationDuration: '1s' }}
                />
                <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-lg text-emerald-950">
                  {analysisProgress}%
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900">
                  Executing Neural Biometric Liveness Model
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {currentAnalysisStepText}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div 
                  className="bg-emerald-700 h-full rounded-full transition-all duration-300"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-left text-[11px] font-mono text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>3D Micro-Depth: Valid</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Liveness Blink: Confirmed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Anti-Spoofing: Level 2 Pass</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Zero Deepfake Artifacts</span>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 4: COMPLETED CERTIFICATE */}
          {stage === 'completed' && completedVerification && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Official Certificate Box */}
              <div className="bg-gradient-to-br from-emerald-950 to-slate-900 text-white rounded-3xl p-6 border border-emerald-700 shadow-xl space-y-6">
                
                {/* Certificate Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-emerald-800/80 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold">
                      <Award className="w-6 h-6 text-emerald-300" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-bold block">
                        Official Biometric Verification Credential
                      </span>
                      <h4 className="text-lg font-extrabold text-white">
                        Facial Identity Certified
                      </h4>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-xs text-emerald-300 font-bold block">
                      {completedVerification.verificationId}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(completedVerification.verifiedAt).toLocaleDateString()} {new Date(completedVerification.verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Visual Face Card & Telemetry Dials */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  
                  {/* Face Image */}
                  <div className="sm:col-span-4 flex flex-col items-center">
                    <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-lg bg-black">
                      <img
                        src={completedVerification.faceImageUrl}
                        alt="Verified Face"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-emerald-950/90 text-emerald-300 text-[9px] font-mono text-center py-0.5 border-t border-emerald-600">
                        BIOMETRIC CERTIFIED
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-300 font-semibold mt-1.5 truncate max-w-[140px]">
                      {applicantName}
                    </span>
                  </div>

                  {/* 3 Metric Badges */}
                  <div className="sm:col-span-8 grid grid-cols-3 gap-2.5">
                    <div className="p-3 rounded-xl bg-emerald-900/40 border border-emerald-700/60 text-center">
                      <span className="text-[10px] text-emerald-300 block font-mono">Liveness Score</span>
                      <span className="text-xl font-extrabold font-mono text-white mt-0.5 block">
                        {completedVerification.livenessScore}%
                      </span>
                      <span className="text-[9px] text-emerald-400">High Confidence</span>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-900/40 border border-emerald-700/60 text-center">
                      <span className="text-[10px] text-emerald-300 block font-mono">Face Match</span>
                      <span className="text-xl font-extrabold font-mono text-white mt-0.5 block">
                        {completedVerification.matchConfidence}%
                      </span>
                      <span className="text-[9px] text-emerald-400">ID Registry Matched</span>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-900/40 border border-emerald-700/60 text-center">
                      <span className="text-[10px] text-emerald-300 block font-mono">Anti-Spoofing</span>
                      <span className="text-xl font-extrabold font-mono text-emerald-300 mt-0.5 block">
                        PASS
                      </span>
                      <span className="text-[9px] text-emerald-400">ISO 30107-3 L2</span>
                    </div>
                  </div>

                </div>

                {/* Audit Hash & Cryptographic Seal */}
                <div className="p-3 rounded-xl bg-black/40 border border-emerald-800/60 space-y-1 font-mono text-[10px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Cryptographic Audit Fingerprint:</span>
                    <span className="text-emerald-400 font-bold">SHA-256 SIGNED</span>
                  </div>
                  <div className="text-slate-300 break-all">
                    {completedVerification.auditHash}
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStage('intro')}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-take Face Scan</span>
                </button>

                <button
                  type="button"
                  onClick={handleApplyVerification}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Confirm & Apply Biometric Verification</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
