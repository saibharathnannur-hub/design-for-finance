document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("bars-container");
    const netValueEl = document.getElementById("net-value");
    const numBars = 120; // Enough resolution for smooth drawing
    const bars = [];
    const barValues = new Array(numBars).fill(0);
    
    let lastX = null;
    let lastY = null;
    let timeoutId = null;
    let interacted = false;

    // 1. Initialize the DOM columns
    for (let i = 0; i < numBars; i++) {
        const wrapper = document.createElement("div");
        wrapper.className = "bar-wrapper";
        
        const bar = document.createElement("div");
        bar.className = "bar";
        bar.style.height = "0px";
        
        wrapper.appendChild(bar);
        container.appendChild(wrapper);
        bars.push(bar);
    }

    // 2. Update the P&L Text Box
    function updateNetValue() {
        const total = barValues.reduce((sum, val) => sum + val, 0);
        const sign = total >= 0 ? '+' : '-';
        // Multiply by 5 just to make the fake dollar amounts look juicier
        const displayValue = Math.abs(Math.round(total * 5));
        
        netValueEl.textContent = `${sign}$${displayValue.toLocaleString()}`;
        netValueEl.style.color = total >= 0 ? '#34d399' : '#fb7185';
    }

    // 3. Set a specific bar's value
    function setBarValue(index, value) {
        barValues[index] = value;
        const bar = bars[index];
        const absDiff = Math.abs(value);
        
        bar.style.height = `${absDiff}px`;
        if (value >= 0) {
            bar.classList.add('positive');
            bar.classList.remove('negative');
        } else {
            bar.classList.add('negative');
            bar.classList.remove('positive');
        }
    }

    // 4. Reset all bars back to ground zero
    function resetBars() {
        container.classList.add('resetting');
        for (let i = 0; i < numBars; i++) {
            barValues[i] = 0;
            bars[i].style.height = "0px";
        }
        updateNetValue();
        lastX = null;
        lastY = null;
    }

    // 5. Manage the 2-second idle timer
    function resetTimer() {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            resetBars();
        }, 2000);
    }

    // 6. Handle Mouse Movement
    document.addEventListener("mousemove", (e) => {
        // Fade out instruction on first interaction
        if (!interacted) {
            const instr = document.getElementById("instruction");
            if(instr) instr.style.opacity = '0';
            interacted = true;
        }

        // Remove resetting class so drawing is instantaneous
        container.classList.remove('resetting');

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const baselineY = windowHeight / 2;
        
        const currentX = e.clientX;
        const currentY = e.clientY;

        // Interpolate over skipped columns if moving mouse fast
        if (lastX !== null && lastY !== null) {
            const steps = Math.max(1, Math.abs(currentX - lastX) / 2); // Sample roughly every 2 pixels
            for (let i = 0; i <= steps; i++) {
                const interpX = lastX + (currentX - lastX) * (i / steps);
                const interpY = lastY + (currentY - lastY) * (i / steps);
                
                const barIndex = Math.floor((interpX / windowWidth) * numBars);
                if (barIndex >= 0 && barIndex < numBars) {
                    const pixelDiff = baselineY - interpY;
                    setBarValue(barIndex, pixelDiff);
                }
            }
        } else {
            const barIndex = Math.floor((currentX / windowWidth) * numBars);
            if (barIndex >= 0 && barIndex < numBars) {
                const pixelDiff = baselineY - currentY;
                setBarValue(barIndex, pixelDiff);
            }
        }

        lastX = currentX;
        lastY = currentY;

        updateNetValue();
        resetTimer();
    });

    // Reset coordinates if cursor leaves the window
    document.addEventListener("mouseleave", () => {
        lastX = null;
        lastY = null;
    });
});
