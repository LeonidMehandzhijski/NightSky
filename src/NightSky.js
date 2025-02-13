import React, { useEffect, useRef } from 'react';
import './App.css';

export default function NightSky() {
    const canvasRef = useRef(null);
    const starsRef = useRef([]); // holds star data (from API or random fallback)
    const offsetRef = useRef({ x: 0, y: 0 }); // current pan offset
    const scaleRef = useRef(1); // current zoom scale
    const isDragging = useRef(false);
    const lastPosRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        // Fetch star data from Stellarium API; fallback to random stars if needed.
        async function fetchStars() {
            try {
                const response = await fetch(
                    'https://api.stellarium-web.org/stars?lat=41.9981&lon=21.4254&date=2023-12-17T22:30:00Z'
                );
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                if (data && data.stars && data.stars.length > 0) {
                    starsRef.current = data.stars;
                } else {
                    console.warn('No star data received; generating random stars.');
                    starsRef.current = generateRandomStars(200);
                }
            } catch (error) {
                console.error('Error fetching star data:', error);
                starsRef.current = generateRandomStars(200);
            }
        }

        // Generate random star data as fallback (normalized x,y between 0 and 1)
        function generateRandomStars(count) {
            const stars = [];
            for (let i = 0; i < count; i++) {
                stars.push({
                    x: Math.random(), // normalized
                    y: Math.random(), // normalized
                    magnitude: Math.random() * 5
                });
            }
            return stars;
        }

        // Draw stars applying pan (translation) and zoom (scaling)
        function drawStars() {
            ctx.save();
            // Clear and fill the background
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, width, height);
            // Apply translation and scaling for interactive pan/zoom
            ctx.translate(offsetRef.current.x, offsetRef.current.y);
            ctx.scale(scaleRef.current, scaleRef.current);
            // Draw each star
            starsRef.current.forEach(star => {
                const x = star.x * width;
                const y = star.y * height;
                const radius = Math.max(1, 5 - star.magnitude);
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, 2 * Math.PI);
                ctx.fillStyle = 'white';
                ctx.fill();
            });
            ctx.restore();
        }

        // Animation loop
        let animationFrameId;
        function render() {
            drawStars();
            animationFrameId = requestAnimationFrame(render);
        }

        fetchStars();
        render();

        // Resize handler: update canvas size and refetch stars
        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            fetchStars();
        };
        window.addEventListener('resize', handleResize);

        // Mouse event handlers for panning
        const handleMouseDown = (e) => {
            isDragging.current = true;
            lastPosRef.current = { x: e.clientX, y: e.clientY };
        };
        const handleMouseMove = (e) => {
            if (!isDragging.current) return;
            const dx = e.clientX - lastPosRef.current.x;
            const dy = e.clientY - lastPosRef.current.y;
            offsetRef.current.x += dx;
            offsetRef.current.y += dy;
            lastPosRef.current = { x: e.clientX, y: e.clientY };
        };
        const handleMouseUp = () => {
            isDragging.current = false;
        };

        // Touch event handlers for mobile panning
        const handleTouchStart = (e) => {
            if (e.touches.length === 1) {
                isDragging.current = true;
                lastPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
        };
        const handleTouchMove = (e) => {
            if (!isDragging.current || e.touches.length !== 1) return;
            const dx = e.touches[0].clientX - lastPosRef.current.x;
            const dy = e.touches[0].clientY - lastPosRef.current.y;
            offsetRef.current.x += dx;
            offsetRef.current.y += dy;
            lastPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        };
        const handleTouchEnd = () => {
            isDragging.current = false;
        };

        // Wheel event handler for zooming
        const handleWheel = (e) => {
            e.preventDefault();
            const zoomFactor = 1.05;
            if (e.deltaY < 0) {
                // zoom in
                scaleRef.current *= zoomFactor;
            } else {
                // zoom out
                scaleRef.current /= zoomFactor;
            }
        };

        // Add event listeners to the canvas
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mouseleave', handleMouseUp);
        canvas.addEventListener('touchstart', handleTouchStart);
        canvas.addEventListener('touchmove', handleTouchMove);
        canvas.addEventListener('touchend', handleTouchEnd);
        canvas.addEventListener('wheel', handleWheel);

        // Cleanup on component unmount
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mouseleave', handleMouseUp);
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchmove', handleTouchMove);
            canvas.removeEventListener('touchend', handleTouchEnd);
            canvas.removeEventListener('wheel', handleWheel);
        };
    }, []);

    return <canvas ref={canvasRef} className="night-sky-canvas" />;
}

