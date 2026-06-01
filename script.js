// 새로고침 시 브라우저 기본 스크롤바 복원 점프 및 렌더링 꼬임(Jank) 예방을 위해 manual로 설정
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}

// --- Preloader Logic ---
(function() {
    const preloader = document.getElementById('preloader');
    const progressBar = document.getElementById('progress-bar');
    const loadingPercent = document.getElementById('loading-percent');
    
    if (preloader) {
        // 새로고침 혹은 사이트 내 재방문(세션 유지 중)인지 체크
        if (sessionStorage.getItem('hasSeenPreloader')) {
            preloader.style.display = 'none';
            return;
        }

        // 최초 접속 시 기록 남기기
        sessionStorage.setItem('hasSeenPreloader', 'true');
        
        let progress = 0;
        let isLoaded = false;
        
        // 프리로더 동작 중에는 스크롤 차단
        document.body.style.overflow = 'hidden';
        
        // 가짜 진행률 시뮬레이션 (최대 90%까지만)
        const progressInterval = setInterval(() => {
            if (!isLoaded && progress < 90) {
                progress += Math.random() * 8;
                if (progress > 90) progress = 90;
                updateProgress(progress);
            }
        }, 150);

        function updateProgress(val) {
            if (progressBar && loadingPercent) {
                progressBar.style.width = `${val}%`;
                loadingPercent.textContent = Math.floor(val);
            }
        }

        // 모든 리소스 로딩 완료 시 100% 채우고 프리로더 제거
        window.addEventListener('load', () => {
            isLoaded = true;
            clearInterval(progressInterval);
            
            setTimeout(() => {
                updateProgress(100);
                setTimeout(() => {
                    preloader.classList.add('hidden');
                    document.body.style.overflow = '';
                    
                    // 페이드아웃 후 완전히 DOM 공간에서 제거
                    setTimeout(() => preloader.style.display = 'none', 800);
                }, 500);
            }, 100);
        });
    }
})();

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
        let cursorInitialized = false;
        document.addEventListener('mousemove', (e) => {
            if (!cursorInitialized) {
                gsap.set(cursor, { opacity: 1 });
                cursorInitialized = true;
            }
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

// STRETCH Horizontal Scroll (Mobile Responsive Bypass via gsap.matchMedia)
try {
    const stretchSection = document.querySelector('.stretch-section');
    const horizontalWrapper = document.querySelector('.horizontal-scroll-wrapper');

    if (stretchSection && horizontalWrapper && typeof gsap !== 'undefined') {
        let mm = gsap.matchMedia();

        // 901px 이상 데스크톱 환경에서만 가로 스크롤 적용
        mm.add("(min-width: 901px)", () => {
            gsap.to(horizontalWrapper, {
                xPercent: -50,
                ease: "none",
                scrollTrigger: {
                    trigger: stretchSection,
                    start: "top top",
                    end: "+=100%",
                    pin: true,
                    scrub: 1,
                    invalidateOnRefresh: true
                }
            });
        });

        // 900px 이하 모바일 환경에서는 스크롤 트리거 강제 정리 및 무력화
        mm.add("(max-width: 900px)", () => {
            gsap.set(horizontalWrapper, { clearProps: "all" });
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
            caseTitle: "차세대 전동화 조립 자율화",
            casePartner: "현대자동차",
            caseSolution: "비정형 차체 조인트 및 호스 조립 공정의 완전 자율화",
            caseEffect: "수동 공정 100% 무인화 및 생산 오차 극감"
        },
        logistics: {
            roi: 20, eff: 50, safe: 80, color: '#ff3366',
            caseTitle: "대형 혼합 화물 피킹 자율화",
            casePartner: "BMW Group",
            caseSolution: "비정형 대형 패키지 인식 및 혼합 하중 적치 자동 조절",
            caseEffect: "피킹 속도 40% 향상 및 중량 노동 대체"
        },
        energy: {
            roi: 30, eff: 40, safe: 95, color: '#f7d100',
            caseTitle: "극온도 시설 무인 자재 이관",
            casePartner: "한화솔루션",
            caseSolution: "고열/극저온 유해 환경 내 응급 설비 점검 및 자재 무인 공급",
            caseEffect: "위험 지역 완전 무인화 및 점검 중단 55% 감소"
        }
    },
    spot: {
        manufacturing: {
            roi: 12, eff: 30, safe: 90, color: '#00d2ff',
            caseTitle: "반도체 클린룸 자동 진단",
            casePartner: "삼성전자",
            caseSolution: "열화상 및 가스 누출 탐지 센서를 활용한 24시간 순찰 자동화",
            caseEffect: "초정밀 누수·열화 감지율 98% 달성 및 불시 중단 방지"
        },
        logistics: {
            roi: 10, eff: 25, safe: 85, color: '#ff3366',
            caseTitle: "메가 허브 야간 재고 분석",
            casePartner: "DHL Express",
            caseSolution: "LiDAR 3D 맵핑 기반 창고 내 자율 이동 및 재고 실사 자동화",
            caseEffect: "실사 대기 시간 70% 단축 및 야간 무인 보안 강화"
        },
        energy: {
            roi: 14, eff: 35, safe: 99, color: '#f7d100',
            caseTitle: "방폭 구역 초음파 감시",
            casePartner: "한국전력",
            caseSolution: "초음파 카메라를 통한 고전원 방전 및 가스 누출 핀포인트 자율 계측",
            caseEffect: "치명적 전력 사고 100% 예방 및 상시 원격 관리"
        }
    },
    stretch: {
        manufacturing: {
            roi: 18, eff: 60, safe: 75, color: '#00d2ff',
            caseTitle: "조립 라인 부품 고속 공급",
            casePartner: "도요타 자동차",
            caseSolution: "스마트 서보 흡착 어셈블리를 활용한 부품 고속 분류 및 자율 피딩",
            caseEffect: "공급 주기 30% 감축 및 제조 리드타임 최적화"
        },
        logistics: {
            roi: 16, eff: 80, safe: 70, color: '#ff3366',
            caseTitle: "수입 컨테이너 하역 자율화",
            casePartner: "CJ대한통운",
            caseSolution: "지능형 픽 비전을 이용한 비규격 밀집 화물 고속 무인 하역",
            caseEffect: "전면 하역 시간 50% 단축 및 하역 근로 부담 제로화"
        },
        energy: {
            roi: 22, eff: 45, safe: 85, color: '#f7d100',
            caseTitle: "방폭 기자재 고속 분류",
            casePartner: "한국가스공사",
            caseSolution: "정밀 회전 암을 이용해 특수 보관창고 내 초저온 밸브 등 자동 추출",
            caseEffect: "긴급 반출 속도 60% 단축 및 특수창고 사고율 0%"
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
        
        // 도입 효과 문장 파싱 (' 및 ' 기준으로 분리)
        const effects = data.caseEffect.split(' 및 ');
        const effectsHtml = effects.map(effect => `
            <div class="sleek-effect-card" style="border-left: 4px solid ${data.color};">
                <div class="sleek-effect-icon" style="color: ${data.color};">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <span class="sleek-effect-text">${effect}</span>
            </div>
        `).join('');

        simCaseStudy.style.setProperty('--brand-color', data.color);
        simCaseStudy.style.setProperty('--brand-color-trans', `${data.color}15`);
        simCaseStudy.style.setProperty('--brand-color-trans-alt', `${data.color}05`);

        simCaseStudy.innerHTML = `
            <div class="sleek-case-header">
                <!-- 큼직하고 스타일리시한 파트너 브랜드 명칭 -->
                <div class="sleek-case-partner-brand" style="color: ${data.color};">
                    ${data.casePartner}
                </div>
                <h3 class="sleek-case-title">${data.caseTitle}</h3>
            </div>
            
            <div class="sleek-case-body">
                <div class="sleek-solution-box">
                    <div class="sleek-label" style="color: ${data.color};">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                        핵심 솔루션
                    </div>
                    <div class="sleek-solution-text">${data.caseSolution}</div>
                </div>

                <div class="sleek-effects-container">
                    <div class="sleek-label" style="color: ${data.color};">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        실제 도입 효과
                    </div>
                    <div class="sleek-effects-list">
                        ${effectsHtml}
                    </div>
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
        if (atlasVideo.duration > 62) {
            atlasVideo.currentTime = 62; 
        }
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
    const startSec = 38.5; // 0:38.5
    const endSec = 108; // 1:48 (1분 48초)
    let isSeeking = false;
    
    const forcePlayHero = () => {
        heroVideo.play().catch(err => {
            console.warn("Hero video play failed, forcing muted:", err);
            heroVideo.muted = true;
            heroVideo.play().catch(e => console.error("Hero play failed:", e));
        });
    };

    // 비디오 로드 완료 시 초기 설정 (브라우저 자체 해시 로드 지원 활용)
    const initVideo = () => {
        forcePlayHero();
    };

    if (heroVideo.readyState >= 1) {
        initVideo();
    } else {
        heroVideo.addEventListener('loadedmetadata', initVideo);
    }

    // timeupdate의 빈도를 쓰로틀링(Throttling)하여 CPU 낭비를 막고 화면 버벅임 완전 박멸
    let lastTimeUpdate = 0;
    heroVideo.addEventListener('timeupdate', () => {
        const now = Date.now();
        if (now - lastTimeUpdate < 250) return; // 250ms 간격으로만 시킹 판단 처리
        lastTimeUpdate = now;

        if (isSeeking) return;

        // [핵심 필터]: 비디오가 로딩 상태이거나 시작점(0초)일 때는 브라우저 자체 해시 시킹을 위해 JS 제어를 건너뜀
        if (heroVideo.currentTime === 0 || heroVideo.readyState < 2) return;

        // 마진을 약간 넉넉하게(-3초) 두어 미세 버퍼링 시 무한 시킹 루프 방지
        if (heroVideo.currentTime < startSec - 3 || heroVideo.currentTime >= endSec) {
            isSeeking = true;
            heroVideo.currentTime = startSec;
            forcePlayHero();
            setTimeout(() => { isSeeking = false; }, 500);
        }
    });
    
    // 만일 영상이 끝났을 경우에도 대비
    heroVideo.addEventListener('ended', () => {
        if (!isSeeking) {
            isSeeking = true;
            heroVideo.currentTime = startSec;
            forcePlayHero();
            setTimeout(() => { isSeeking = false; }, 500);
        }
    });
}

// --- ATLAS MODAL VIDEO PLAYER LOGIC (REDUNDANT REMOVED, HANDLED BY INLINE SCRIPT) ---
