import React, { useState, Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera, Environment, ContactShadows, Float, useGLTF } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import * as THREE from 'three'
import { StarBackground } from './Stars'

const SHIP_DATA = [
  { id: 1, name: "X-WING INTERCEPTOR", themeColor: "#22d3ee", class: "Heavy Fighter", modelPath: "/models/ship1.glb", stats: { speed: 85, attack: 92, defense: 40, energy: 60 }, lore: "Modified rebel interceptor with twin-core engines optimized for atmospheric dogfights." },
  { id: 2, name: "STELLAR EXPANSE", themeColor: "#ff00ff", class: "Corvette", modelPath: "/models/ship2.glb", stats: { speed: 60, attack: 75, defense: 80, energy: 90 }, lore: "Hull tempered by singularity exposure. Highly resistant to gravitational sheer and radiation." },
  { id: 3, name: "NEBULA STRIKER", themeColor: "#00ff88", class: "Stealth Frigate", modelPath: "/models/ship3.glb", stats: { speed: 95, attack: 50, defense: 30, energy: 100 }, lore: "Equipped with phase-shift plating. Capable of multi-dimensional stealth maneuvers." },
  { id: 4, name: "IRON MANTLE", themeColor: "#ffaa00", class: "Heavy Cruiser", modelPath: "/models/ship4.glb", stats: { speed: 30, attack: 85, defense: 95, energy: 70 }, lore: "A dreadnought fortress. Boasts the highest structural integrity rating in the current fleet." },
  { id: 5, name: "VOID RUNNER", themeColor: "#ff3333", class: "Scout Ship", modelPath: "/models/ship5.glb", stats: { speed: 100, attack: 20, defense: 20, energy: 85 }, lore: "Dark-matter drive prototype. Maximum velocity exceeds standard safety parameters." },
  { id: 6, name: "AETHER WARDEN", themeColor: "#9966ff", class: "Support Vessel", modelPath: "/models/ship6.glb", stats: { speed: 55, attack: 40, defense: 70, energy: 95 }, lore: "Carry localized magnetic emitters used to jumpstart disabled fleet vessels mid-combat." },
  { id: 7, name: "APOLLO'S WRATH", themeColor: "#ffffff", class: "Destroyer", modelPath: "/models/ship7.glb", stats: { speed: 45, attack: 100, defense: 60, energy: 50 }, lore: "White dwarf core-fusion cannon. Draws thermal energy directly from the ship's reactor." }
];

function Spaceship({ modelPath, scale = 1, isPreview = false }) {
  const meshRef = useRef()
  const { scene } = useGLTF(modelPath)
  const clonedScene = useMemo(() => {
    const clone = scene.clone()
    const box = new THREE.Box3().setFromObject(clone)
    const center = new THREE.Vector3()
    box.getCenter(center)
    clone.position.sub(center) 
    return clone
  }, [scene, modelPath])

  useFrame((state) => {
    if (!meshRef.current) return
    if (isPreview) {
      meshRef.current.rotation.y += 0.012
    } else {
      const targetX = (state.pointer.x * Math.PI) / 8
      const targetY = (state.pointer.y * Math.PI) / 12
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetX, 0.15)
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -targetY, 0.15)
    }
  })
  return <primitive ref={meshRef} object={clonedScene} scale={scale} />
}

const HUDTrace = ({ theme, active, type }) => {
  const path = type === "card" 
    ? "M 10,0 L 100,0 L 100,85 L 90,100 L 0,100 L 0,15 Z" 
    : "M 0,0 L 100,0 L 100,96 L 96,100 L 0,100 Z";
    
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }} viewBox="0 0 100 100" preserveAspectRatio="none">
      <path d={path} fill="none" stroke={active ? theme : "rgba(255,255,255,0.1)"} strokeWidth="1" />
      {active && <path className="trace-path" d={path} fill="none" stroke="white" strokeWidth="1.5" />}
    </svg>
  )
}

function ShipCard({ ship, active, onClick }) {
  const theme = ship.themeColor;
  return (
    <div onClick={onClick} className={`ship-card ${active ? 'active' : ''}`} style={{
      width: '12vw', height: '140px', background: active ? `${theme}10` : 'rgba(0,0,0,0.85)',
      cursor: 'pointer', transition: '0.3s', position: 'relative', display: 'flex', flexDirection: 'column',
      clipPath: 'polygon(10% 0, 100% 0, 100% 85%, 90% 100%, 0 100%, 0 15%)'
    }}>
      <HUDTrace theme={theme} active={active} type="card" />
      <div style={{ width: '100%', textAlign: 'center', paddingTop: '12px', fontSize: '9px', color: active ? '#fff' : theme, fontWeight: '900', zIndex: 15, letterSpacing: '2px' }}>{ship.name.split(' ')[0]}</div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '10px' }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 35 }}>
          <ambientLight intensity={2} /><pointLight position={[5, 5, 5]} intensity={12} color={theme} /> 
          <Suspense fallback={null}><Spaceship modelPath={ship.modelPath} scale={1.7} isPreview={true} /><Environment preset="city" /></Suspense>
        </Canvas>
      </div>
    </div>
  )
}

export default function App() {
  const [currentShip, setCurrentShip] = useState(SHIP_DATA[0]);
  const theme = currentShip.themeColor;

  return (
    <div className="dashboard-container flicker">
      <div className="background-3d"><Canvas><StarBackground speed={0.1} /></Canvas></div>
      <div className="main-3d"><Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={35} />
        <directionalLight position={[10, 10, 10]} intensity={4} /><spotLight position={[-10, 10, 10]} intensity={3} color={theme} />
        <Suspense fallback={null}>
          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}><Spaceship key={currentShip.id} modelPath={currentShip.modelPath} scale={2.2} /></Float>
          <Environment preset="night" /><ContactShadows position={[0, -1.2, 0]} opacity={0.5} scale={10} blur={2.5} far={4} color={theme} />
        </Suspense>
        <EffectComposer><Bloom intensity={1.2} /><ChromaticAberration offset={[0.0006, 0.0006]} /></EffectComposer>
      </Canvas></div>

      <div className="ui-root">
        <div className="header-hud">
          <div className="title-block">
            <h1 className="ship-title" style={{ textShadow: `0 0 50px ${theme}66`, fontSize: '5rem' }}>{currentShip.name}</h1>
            <div className="class-tag" style={{ color: theme, fontSize: '14px' }}><span className="blink">●</span> {currentShip.class} // SYSTEM_READY</div>
          </div>

          <div className="stats-panel-slim">
            <HUDTrace theme={theme} active={true} type="stats" />
            <div className="stats-header" style={{ color: theme }}>TACTICAL_INTEL_v6.1</div>
            
            <div className="stats-section">
              {Object.entries(currentShip.stats).map(([key, val], index) => (
                <div key={key} className="stat-row">
                  <div className="stat-label" style={{ color: theme }}>
                    <span>{key.toUpperCase()}</span>
                    <span>{val}%</span>
                  </div>
                  <div className="stat-bar-bg">
                    {/* Width is now explicitly derived from the ship stats */}
                    <div 
                      className="stat-bar-fill" 
                      style={{ 
                        width: `${val}%`, 
                        background: theme, 
                        boxShadow: `0 0 10px ${theme}`,
                        transitionDelay: `${index * 0.1}s` 
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="lore-section">
              <div style={{ color: theme, fontSize: '7px', marginBottom: '6px', letterSpacing: '1px', opacity: 0.6 }}>// ARCHIVE_DATA</div>
              <p className="lore-text">{currentShip.lore}</p>
            </div>

            <div className="detail-list">
              <div className="detail-item"><span style={{color: theme}}>HULL:</span> STABLE</div>
              <div className="detail-item"><span style={{color: theme}}>CORE:</span> NOMINAL</div>
              <div className="detail-item"><span style={{color: theme}}>SIG:</span> TRACE_LOW</div>
            </div>

            <div className="event-log">
 	      {/* Replace > with &gt; */}
  	      <div className="log-line">&gt; SYNCING_BIOMETRICS...</div>
  	      <div className="log-line" style={{color: theme}}>&gt; DEPLOYMENT_READY</div>
	    </div>
          </div>
        </div>
        
        <div className="footer-hud">
          <div className="ship-rail">
            {SHIP_DATA.map((ship) => ( <ShipCard key={ship.id} ship={ship} active={currentShip.id === ship.id} onClick={() => setCurrentShip(ship)} /> ))}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
        .dashboard-container { width: 100vw; height: 100vh; background: #000; color: white; font-family: 'Orbitron', sans-serif; overflow: hidden; position: relative; }
        .background-3d, .main-3d { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
        .ui-root { position: relative; z-index: 10; height: 100%; display: flex; flex-direction: column; padding: 40px 60px; pointer-events: none; box-sizing: border-box; }
        
        .header-hud { display: flex; justify-content: space-between; align-items: flex-start; }
        .ship-title { margin: 0; font-weight: 900; font-style: italic; letter-spacing: -3px; line-height: 1; transition: 0.5s; }
        .class-tag { letter-spacing: 8px; margin-top: 15px; font-weight: 700; opacity: 0.8; }

        .stats-panel-slim { 
          width: 280px; height: 520px; padding: 25px; position: relative; 
          background: rgba(0,0,0,0.92); backdrop-filter: blur(25px);
        }
        .stats-header { font-size: 9px; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; letter-spacing: 2px; }
        
        .stat-row { margin-bottom: 18px; width: 100%; }
        .stat-label { display: flex; justify-content: space-between; font-size: 9px; margin-bottom: 6px; font-weight: 900; }
        .stat-bar-bg { height: 2px; background: rgba(255,255,255,0.08); width: 100%; position: relative; }

        .lore-section { margin-bottom: 20px; border-left: 1px solid rgba(255,255,255,0.1); padding-left: 12px; }
        .lore-text { font-size: 9px; line-height: 1.5; opacity: 0.7; font-weight: 400; margin: 0; }

        .detail-list { display: flex; flex-direction: column; gap: 8px; font-size: 8px; margin-bottom: 20px; font-weight: 700; }
        .detail-item { background: rgba(255,255,255,0.03); padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); }

        .event-log { font-family: monospace; font-size: 8px; opacity: 0.4; line-height: 1.8; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 12px; }

        .footer-hud { margin-top: auto; width: 100%; display: flex; justify-content: center; pointer-events: auto; padding-bottom: 20px; }
        .ship-rail { display: flex; gap: 1.2vw; justify-content: center; width: 100%; max-width: 1400px; }

        .stat-bar-fill { height: 100%; transition: width 1s cubic-bezier(0.23, 1, 0.32, 1); }

        .trace-path { stroke-dasharray: 40 160; animation: trace-move 3s linear infinite; }
        @keyframes trace-move { 0% { stroke-dashoffset: 200; } 100% { stroke-dashoffset: 0; } }
        .flicker { animation: ui-flicker 0.2s infinite alternate; }
        @keyframes ui-flicker { 0% { opacity: 0.99; } 100% { opacity: 1; } }
        @keyframes blink { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
      `}</style>
    </div>
  )
}