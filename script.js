// Initialize Lenis for Smooth Scrolling (CDN 미로드 대비 방어 장치 장착)
let lenis;
try {
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        function raf(time) {
            if (lenis) lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }
} catch (error) {
    console.warn("Lenis 부드러운 스크롤 초기화가 건너뛰어졌습니다 (외부 CDN 로드 대기 중이거나 오프라인 상태):", error);
}

// Integrate GSAP with Lenis
try {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        if (lenis) {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);
        }
    }
} catch (error) {
    console.warn("GSAP/ScrollTrigger 연동이 건너뛰어졌습니다:", error);
}

// Custom Cursor Logic (Touch Device Check Added)
try {
    const cursor = document.querySelector('.cursor');
    const hoverTargets = document.querySelectorAll('.hover-target, a, button, select');
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice && cursor) {
        cursor.style.display = 'none';
        document.body.style.cursor = 'auto';
    } else if (cursor && typeof gsap !== 'undefined') {
        document.addEventListener('mousemove', (e) => {
            gsap.to(cursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.1,
                ease: "power2.out"
            });
        });

        hoverTargets.forEach(target => {
            target.addEventListener('mouseenter', () => {
                cursor.classList.add('active');
            });
            target.addEventListener('mouseleave', () => {
                cursor.classList.remove('active');
            });
        });
    }
} catch (error) {
    console.warn("커스텀 커서 제어 중 오류 발생:", error);
}

// Text Reveal Animation (SplitType)
try {
    if (typeof SplitType !== 'undefined' && typeof gsap !== 'undefined') {
        const splitTypes = document.querySelectorAll('.reveal-text');

        splitTypes.forEach((char) => {
            const text = new SplitType(char, { types: 'lines, words' });

            gsap.from(text.words, {
                scrollTrigger: {
                    trigger: char,
                    start: 'top 90%',
                    end: 'top 20%',
                    scrub: false,
                    toggleActions: 'play none none reverse'
                },
                y: 100,
                opacity: 0,
                stagger: 0.05,
                duration: 0.8,
                ease: 'power4.out'
            });
        });
    }
} catch (error) {
    console.warn("텍스트 모션(SplitType) 효과가 건너뛰어졌습니다:", error);
}

// SPOT Section Animation
try {
    if (typeof gsap !== 'undefined') {
        gsap.to('.bg-text', {
            scrollTrigger: {
                trigger: '.spot-section',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1
            },
            y: 100,
            opacity: 0.2,
            scale: 1.05
        });
    }
} catch (error) {
    console.warn("SPOT 애니메이션이 건너뛰어졌습니다:", error);
}

// STRETCH Horizontal Scroll
try {
    const stretchSection = document.querySelector('.stretch-section');
    const horizontalWrapper = document.querySelector('.horizontal-scroll-wrapper');

    if (stretchSection && horizontalWrapper && typeof gsap !== 'undefined') {
        gsap.to(horizontalWrapper, {
            xPercent: -50,
            ease: "none",
            scrollTrigger: {
                trigger: stretchSection,
                start: "top top",
                end: "+=100%",
                pin: true,
                scrub: 1
            }
        });
    }
} catch (error) {
    console.warn("STRETCH 수평 스크롤 모션이 건너뛰어졌습니다:", error);
}

// --- INTERACTIVE DASHBOARD PROTOTYPE LOGIC ---
const dashboardData = {
    atlas: {
        manufacturing: {
            roi: 24, eff: 45, safe: 88, color: '#00d2ff',
            caseTitle: "현대자동차 차세대 전동화 조립 자율화",
            casePartner: "Hyundai Motors",
            caseSolution: "전신 자율 제어 능력을 바탕으로 비정형 차체 조인트 및 호스를 파지하고 조립 공정에 자율 최적 배치하는 복합 제조 프로세스 대체.",
            caseEffect: "조립 라인 고난도 수동 공정 완벽 자율 자동화 전환 및 생산 오차 극감"
        },
        logistics: {
            roi: 20, eff: 50, safe: 80, color: '#ff3366',
            caseTitle: "BMW 그룹 대형 혼합 피킹 자율 최적화",
            casePartner: "BMW Group",
            caseSolution: "인간과 유사한 이동성을 통해 물류 창고에서 비정형 대형 패키지 및 부품 박스(최대 25kg)를 인식 및 컨테이너 혼합 하중 적치 자율 조절.",
            caseEffect: "혼합형 적재 피킹 속도 40% 증가 및 반복성 중량 노동 완전 대체"
        },
        energy: {
            roi: 30, eff: 40, safe: 95, color: '#f7d100',
            caseTitle: "한화솔루션 극온도 가공 시설 자재 이관",
            casePartner: "Hanwha Solution",
            caseSolution: "고열 가온실 내부 등 유해 환경에서 실시간 기동 및 고정밀 매커니즘을 이용해 태양광 모듈 공급 및 응급 설비 오작동 조치 무인 수행.",
            caseEffect: "초고온 위험 지역 무인화 100% 실현 및 설비 점검 중단 리스크 55% 감소"
        }
    },
    spot: {
        manufacturing: {
            roi: 12, eff: 30, safe: 90, color: '#00d2ff',
            caseTitle: "삼성전자 반도체 클린룸 열화상 자동 진단",
            casePartner: "Samsung Electronics",
            caseSolution: "가스 누출 진단 페이로드와 고밀도 적외선 카메라를 장착하여 클린룸 내 초밀집 배관망을 따라 24시간 미세 이상 탐지 및 순찰 자동화.",
            caseEffect: "초정밀 반도체 제조 기설 누수·열화 감지율 98% 달성으로 불시 중단 방지"
        },
        logistics: {
            roi: 10, eff: 25, safe: 85, color: '#ff3366',
            caseTitle: "DHL 메가 허브 무인 야간 상시 재고 분석",
            casePartner: "DHL Express",
            caseSolution: "고성능 LiDAR 3D 맵핑 시스템을 활용하여 물류 창고의 입체 랙 사이를 자율 이동하며 불일치 바코드 감색 및 재고 실사 자동 파악.",
            caseEffect: "수작업 실사 대기 시간 70% 단축 및 야간 무인 침입·화재 센싱 강화"
        },
        energy: {
            roi: 14, eff: 35, safe: 99, color: '#f7d100',
            caseTitle: "한국전력 고압 변전소 방폭 구역 초음파 감시",
            casePartner: "KEPCO",
            caseSolution: "자율 도킹 충전 스테이션과 연계하여 24시간 초음파 카메라로 고전원 방전 및 미세 절연 파괴 징후, 가스 누출 부위를 고정밀 자율 핀포인트 계측.",
            caseEffect: "감전 및 아크 등 치명적인 전력 사고율 100% 예방 및 상시 원격 관리 실현"
        }
    },
    stretch: {
        manufacturing: {
            roi: 18, eff: 60, safe: 75, color: '#00d2ff',
            caseTitle: "도요타 자동차 조립 라인 부품 고속 공급",
            casePartner: "Toyota Motors",
            caseSolution: "장중량 스마트 서보 흡착 어셈블리를 활용하여 부품 박스 트레이로부터 어셈블리 공급 컨베이어 벨트까지 고속 분류 자율 피딩.",
            caseEffect: "라인 부품 공급 주기 시간 30% 감축 및 제조 리드타임 최적화 연계 달성"
        },
        logistics: {
            roi: 16, eff: 80, safe: 70, color: '#ff3366',
            caseTitle: "CJ대한통운 메가 센터 수입 컨테이너 하역 자율화",
            casePartner: "CJ Logistics",
            caseSolution: "지능형 흡착 시스템과 패턴 AI 픽 비전을 이용하여 컨테이너 내부의 비규격 테트리스형 밀집 화물을 고속 무인 하역 프로세스로 연동.",
            caseEffect: "수입 컨테이너 전면 하역 시간 50% 단축 및 하역 수작업 근로 부담 제로화"
        },
        energy: {
            roi: 22, eff: 45, safe: 85, color: '#f7d100',
            caseTitle: "한국가스공사 LNG 보관창고 방폭 부품 고속 분류",
            casePartner: "KOGAS",
            caseSolution: "특화된 정밀 회전 암을 이용해 초저온 밸브 및 대형 배관 부품 적재함에서 고가 방폭 유지보수 기자재를 오차 없이 추출하여 자동 이송 연계.",
            caseEffect: "자재 긴급 반출 및 물동 속도 60% 단축 및 안전 등급 특수창고 사고율 0%"
        }
    }
};

let currentDevice = 'atlas';
let currentIndustry = 'manufacturing';

const toggleBtns = document.querySelectorAll('.toggle-btn');
const industrySelect = document.getElementById('industry-select');

// DOM Elements for Chart
const roiCount = document.getElementById('roi-months');
const effCount = document.getElementById('eff-percent');
const safeCount = document.getElementById('safe-percent');
const roiBar = document.getElementById('roi-bar');
const effBar = document.getElementById('eff-bar');
const safeBar = document.getElementById('safe-bar');
const simStatus = document.getElementById('sim-status');
const simCaseStudy = document.getElementById('sim-case-study');

function updateDashboard() {
    const data = dashboardData[currentDevice][currentIndustry];

    // Animate Numbers using GSAP counter
    gsap.to(roiCount, { innerHTML: data.roi, duration: 1, roundProps: "innerHTML", ease: "power2.out" });
    gsap.to(effCount, { innerHTML: data.eff, duration: 1, roundProps: "innerHTML", ease: "power2.out" });
    gsap.to(safeCount, { innerHTML: data.safe, duration: 1, roundProps: "innerHTML", ease: "power2.out" });

    // Update Bars
    roiBar.style.width = `${(data.roi / 36) * 100}%`; // max 36 months baseline
    effBar.style.width = `${data.eff}%`;
    safeBar.style.width = `${data.safe}%`;

    // Color code based on industry
    roiBar.style.backgroundColor = data.color;

    // Simulate Video Changing
    simStatus.textContent = `${currentDevice.toUpperCase()} 시뮬레이션 데이터 로드 중...`;
    simCaseStudy.classList.remove('active');

    setTimeout(() => {
        simStatus.textContent = `${currentDevice.toUpperCase()} x ${currentIndustry.toUpperCase()} 자율 작업 최적화 완료`;
        
        simCaseStudy.innerHTML = `
            <div class="case-header">
                <span class="case-title">${data.caseTitle}</span>
                <span class="case-company-tag" style="border: 1px solid ${data.color}; color: ${data.color};">${data.casePartner}</span>
            </div>
            <div class="case-grid">
                <div class="case-block">
                    <span class="case-label">핵심 도입 솔루션</span>
                    <span class="case-value">${data.caseSolution}</span>
                </div>
                <div class="case-metrics-brief" style="border-left: 3px solid ${data.color};">
                    <span class="case-label">실제 도입 효과</span>
                    <span class="case-value highlight" style="color: ${data.color};">${data.caseEffect}</span>
                </div>
            </div>
        `;
        simCaseStudy.classList.add('active');
    }, 800);
}

// Event Listeners
toggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        toggleBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentDevice = e.target.getAttribute('data-device');
        updateDashboard();
    });
});

industrySelect.addEventListener('change', (e) => {
    currentIndustry = e.target.value;
    updateDashboard();
});

// Initialize Dashboard
updateDashboard();


// --- LIVE FIREBASE BOARD PROTOTYPE LOGIC ---
const feedWrapper = document.getElementById('feed-wrapper');

const mockUseCases = [
    { company: 'Hyundai Motors', time: 'Just now', content: 'Spot을 통한 전기차 조립 라인 야간 무인 순찰 및 화재 감지 테스트 완료. (안전 사고 0건 달성)' },
    { company: 'Amazon Logistics', time: '2m ago', content: 'Stretch 20대 추가 도입 계약 체결. 일일 하역량 200% 증가 기대.' },
    { company: 'BP Energy', time: '5m ago', content: '해상 플랜트에 Spot 배치 완료. 유해가스 누출 자율 감지 루틴 가동 시작.' },
    { company: 'Boston Dynamics Support', time: '12m ago', content: '[Firmware Update] Atlas V2.1 배포 - 동적 보행 안정성 15% 개선.' },
    { company: 'Tesla Giga Berlin', time: '1h ago', content: 'Spot 기반 디지털 트윈 구축 완료. 공장 3D 매핑 오차율 0.01% 달성.' }
];

// Initial render
mockUseCases.forEach(item => addCardToFeed(item));

function addCardToFeed(data, prepend = false) {
    const card = document.createElement('div');
    card.className = 'feed-card';
    card.innerHTML = `
        <div class="feed-header">
            <span class="feed-company">${data.company}</span>
            <span>${data.time}</span>
        </div>
        <div class="feed-content">${data.content}</div>
    `;

    if (prepend) {
        feedWrapper.insertBefore(card, feedWrapper.firstChild);
        // Animate new card
        gsap.from(card, { y: -50, opacity: 0, duration: 0.5, ease: "power2.out" });
        // Remove last card to keep feed clean
        if (feedWrapper.children.length > 5) {
            feedWrapper.removeChild(feedWrapper.lastChild);
        }
    } else {
        feedWrapper.appendChild(card);
    }
}

// Simulate Live Feed Updates every 6 seconds
const liveUpdates = [
    { company: 'Samsung SDI', time: 'Just now', content: '배터리 공장 내 Spot 기반의 열화상 검사 시스템 연동 완료.' },
    { company: 'DHL Express', time: 'Just now', content: 'Stretch 물류 허브 시범 도입 성공. 시간당 처리량 800박스 기록.' },
    { company: 'Chevron', time: 'Just now', content: '정유 공장 배관 점검에 Spot 투입. 검사 소요 시간 40% 단축.' },
    { company: 'SpaceX', time: 'Just now', content: '발사대 위험 지역 안전 확보를 위한 Spot 2차 테스트 성공.' }
];

let updateIndex = 0;
setInterval(() => {
    if (updateIndex < liveUpdates.length) {
        // Update old times
        const timeSpans = feedWrapper.querySelectorAll('.feed-header span:last-child');
        timeSpans.forEach(span => {
            if (span.textContent === 'Just now') span.textContent = '1m ago';
            else if (span.textContent === '1m ago') span.textContent = '2m ago';
        });

        addCardToFeed(liveUpdates[updateIndex], true);
        updateIndex++;
    }
}, 6000);


// --- ATLAS LOCAL VIDEO BACKGROUND LOGIC ---
const atlasVideo = document.getElementById('atlas-video');
if (atlasVideo) {
    const forcePlayAtlas = () => {
        atlasVideo.play().catch(err => {
            console.warn("Atlas video play failed, forcing muted:", err);
            atlasVideo.muted = true;
            atlasVideo.play().catch(e => console.error("Atlas play failed:", e));
        });
    };

    const setStartTime = () => { 
        atlasVideo.currentTime = 62; 
        forcePlayAtlas();
    };

    if (atlasVideo.readyState >= 1) {
        setStartTime();
    } else {
        atlasVideo.addEventListener('loadedmetadata', setStartTime);
    }

    atlasVideo.addEventListener('ended', () => {
        setStartTime();
    });
}

// --- HERO LOCAL VIDEO BACKGROUND LOGIC ---
const heroVideo = document.getElementById('hero-video');
if (heroVideo) {
    const startSec = 38.3; // 0:38.3
    const endSec = 108; // 1:48 (1분 48초)
    
    const forcePlayHero = () => {
        heroVideo.play().catch(err => {
            console.warn("Hero video play failed, forcing muted:", err);
            heroVideo.muted = true;
            heroVideo.play().catch(e => console.error("Hero play failed:", e));
        });
    };

    // 비디오 로드 완료 시 초기 설정 (HTML 자체 미디어 프래그먼트 #t=38.3,108과의 더블 시킹 지연 제거)
    const initVideo = () => {
        if (Math.abs(heroVideo.currentTime - startSec) > 2) {
            heroVideo.currentTime = startSec;
        }
        forcePlayHero();
    };

    if (heroVideo.readyState >= 1) {
        initVideo();
    } else {
        heroVideo.addEventListener('loadedmetadata', initVideo);
    }

    // timeupdate 이벤트를 통해 강제 구간 제어
    heroVideo.addEventListener('timeupdate', () => {
        // 구간을 벗어나면 무조건 시작점으로 되돌림
        if (heroVideo.currentTime < startSec - 1 || heroVideo.currentTime >= endSec) {
            heroVideo.currentTime = startSec;
            forcePlayHero();
        }
    });
    
    // 만일 영상이 끝났을 경우에도 대비
    heroVideo.addEventListener('ended', () => {
        heroVideo.currentTime = startSec;
        forcePlayHero();
    });
}

// --- ATLAS MODAL VIDEO PLAYER LOGIC (REDUNDANT REMOVED, HANDLED BY INLINE SCRIPT) ---
