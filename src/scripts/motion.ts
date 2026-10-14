/**
 * 스크롤·등장 연출. prefers-reduced-motion이면 아무것도 하지 않는다
 * (그 경우 CSS 폴백이 그대로 동작).
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduced) init();

function init() {
  gsap.registerPlugin(ScrollTrigger);

  // 로고는 transition:persist로 페이지를 옮겨도 남으므로 처음 한 번만 붙인다
  logo();

  // ClientRouter가 body를 갈아 끼우므로 페이지 연출은 매 페이지 새로 붙이고,
  // 교체 직전에 이전 페이지의 트윈과 ScrollTrigger를 되돌린다
  let page: gsap.Context | undefined;
  document.addEventListener('astro:page-load', () => {
    page = gsap.context(() => {
      ignite();
      heroParallax();
      cards();
      shots();
      counters();
      downloadIcons();
    });
  });
  document.addEventListener('astro:before-swap', () => page?.revert());
}

/** 텍스트 노드를 글자 단위 span으로 쪼갠다. 태그 구조(em, br 등)는 유지 */
function splitChars(el: Element) {
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      for (const ch of node.textContent ?? '') {
        if (ch.trim() === '') {
          frag.append(ch);
          continue;
        }
        const s = document.createElement('span');
        s.className = 'ch';
        s.textContent = ch;
        frag.append(s);
      }
      node.replaceWith(frag);
    } else if (node instanceof HTMLElement && node.tagName !== 'BR') {
      splitChars(node);
    }
  }
}

/** 네온 간판 점등: 글자가 순서대로 깜빡이며 켜진다 */
function ignite() {
  const title = document.querySelector<HTMLElement>('[data-motion="title"]');
  if (!title) return;
  splitChars(title);
  title.classList.add('is-js');
  const chars = title.querySelectorAll('.ch');
  gsap.set(chars, { opacity: 0.08 });
  gsap.to(chars, {
    keyframes: [
      { opacity: 1, duration: 0.08 },
      { opacity: 0.3, duration: 0.06 },
      { opacity: 1, duration: 0.14 },
    ],
    stagger: 0.075,
    ease: 'none',
    delay: 0.25,
  });
}

/** 히어로가 스크롤 속도의 절반으로 따라 올라오며 흐려진다 */
function heroParallax() {
  const hero = document.querySelector('[data-motion="hero"]');
  const title = document.querySelector('[data-motion="title"]');
  const lede = document.querySelector('[data-motion="lede"]');
  if (!hero || !title) return;
  const st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
  gsap.to(title, { yPercent: -30, opacity: 0, ease: 'none', scrollTrigger: st });
  if (lede) gsap.to(lede, { yPercent: -60, opacity: 0, ease: 'none', scrollTrigger: st });
}

/** 메뉴판 카드가 양옆에서 미끄러져 들어온다 */
function cards() {
  document.querySelectorAll<HTMLElement>('[data-motion="card"]').forEach((el, i) => {
    gsap.from(el, {
      x: i % 2 === 0 ? -80 : 80,
      opacity: 0,
      duration: 1.1,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });
}

/** 스크린샷이 살짝 누운 채 올라오다 정면으로 선다 (스크롤에 묶임) */
function shots() {
  document.querySelectorAll<HTMLElement>('[data-motion="shot"]').forEach((el) => {
    gsap.fromTo(
      el,
      { y: 70, rotateX: 9, opacity: 0.15, transformOrigin: 'center top' },
      {
        y: 0,
        rotateX: 0,
        opacity: 1,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 96%', end: 'top 58%', scrub: 0.5 },
      },
    );
  });
}

/** 감쇠 스프링 이징: 목표를 지나쳤다가 osc번 출렁이며 멈춘다 */
function spring(osc: number, decay: number) {
  return (t: number) => (t >= 1 ? 1 : 1 - Math.exp(-decay * t) * Math.cos(osc * 2 * Math.PI * t));
}

/** 자는 베개 로고: 떨어져 착지하고, 가끔 한숨을 쉬고, 올리면 묵직하게 눌렸다 돌아온다 */
function logo() {
  const svg = document.querySelector<SVGSVGElement>('[data-motion="logo"]');
  const brand = svg?.closest<HTMLElement>('.brand');
  const squash = svg?.querySelector('.squash');
  const body = svg?.querySelector('.body');
  const face = svg?.querySelector('.face');
  const eyes = svg?.querySelector('.eyes');
  if (!brand || !squash || !body || !face || !eyes) return;

  // 베개 바닥 가운데를 기준으로 눌리고 부푼다
  gsap.set([squash, body], { svgOrigin: '32 49' });
  gsap.set(eyes, { svgOrigin: '32 32' });

  const intro = gsap
    .timeline({ delay: 0.15 })
    .fromTo(squash, { y: -60, scaleY: 1.25, scaleX: 0.85 }, { y: 0, duration: 0.45, ease: 'power3.in' })
    .to(squash, { scaleY: 0.78, scaleX: 1.15, duration: 0.08, ease: 'power2.out' })
    .to(squash, { scaleX: 1, scaleY: 1, duration: 0.9, ease: spring(2, 6) });

  // 한숨: 천천히 들이마셔 몸통이 부풀고(얼굴은 크기 그대로 따라 올라감), 푸우 내쉬며 살짝 꺼졌다 돌아온다
  gsap
    .timeline({ repeat: -1, repeatDelay: 4.5, delay: intro.duration() + 1.2 })
    .to(body, { scaleY: 1.09, scaleX: 1.04, duration: 0.9, ease: 'sine.inOut' })
    .to(face, { y: -1.5, duration: 0.9, ease: 'sine.inOut' }, '<')
    .to(body, { scaleY: 0.96, scaleX: 1.03, duration: 0.45, ease: 'power1.out' }, '+=0.15')
    .to(face, { y: 0.6, duration: 0.45, ease: 'power1.out' }, '<')
    .to(body, { scaleY: 1, scaleX: 1, duration: 0.8, ease: spring(1, 6) })
    .to(face, { y: 0, duration: 0.8, ease: spring(1, 6) }, '<');

  // 호버: 묵직한 덩어리라 천천히 움츠렸다 눌리고, 출렁임은 한 번 반만
  const settle = spring(1.5, 5);
  const poke = gsap
    .timeline({ paused: true })
    .to(squash, { scaleY: 1.06, scaleX: 0.96, duration: 0.28, ease: 'power2.out' })
    .to(squash, { scaleY: 0.8, scaleX: 1.12, duration: 0.22, ease: 'power2.in' })
    .to(eyes, { scaleY: 0.4, duration: 0.22, ease: 'power2.in' }, '<')
    .addLabel('settle')
    .to(squash, { scaleX: 1, scaleY: 1, duration: 1.2, ease: settle }, 'settle')
    .to(eyes, { scaleY: 1, duration: 0.9, ease: settle }, 'settle+=0.1');

  const play = () => {
    if (!intro.isActive() && !poke.isActive()) poke.restart();
  };
  brand.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse') play();
  });
  brand.addEventListener('focus', () => {
    if (brand.matches(':focus-visible')) play();
  });
}

/** 다운로드 바닥. dip > 0이면 가운데가 트램펄린처럼 눌리고 옆면이 안쪽으로 기운다 */
function trayD(dip: number) {
  const s = dip * 0.35;
  return `M${21 - s} 15L21 19a2 2 0 0 1-2 2Q12 ${21 + dip * 2} 5 21a2 2 0 0 1-2-2L${3 + s} 15`;
}

/** 다운로드 버튼에 올리면 화살표가 움츠렸다 떨어지고, 바닥과 버튼이 눌렸다 출렁인다 */
function downloadIcons() {
  const ease = spring(2, 6);
  document.querySelectorAll<SVGSVGElement>('[data-motion="dl-icon"]').forEach((svg) => {
    const btn = svg.closest<HTMLElement>('.btn');
    const tray = svg.querySelector('.tray');
    const arrow = svg.querySelector('.arrow');
    const head = svg.querySelector('.head');
    if (!btn || !tray || !arrow || !head) return;

    const dip = { v: 0 };
    const drawTray = () => tray.setAttribute('d', trayD(dip.v));
    gsap.set([arrow, head], { svgOrigin: '12 15' });

    const tl = gsap.timeline({ paused: true });
    tl
      // CSS transform 트랜지션이 매 프레임 값을 뒤쫓지 않도록 재생 중엔 그림자만 남긴다
      .set(btn, { transformOrigin: '50% 100%', transition: 'box-shadow var(--dur-fast) var(--ease-out)' })
      // 예비 동작 → 늘어나며 낙하
      .to(arrow, { y: -1.6, scaleY: 0.86, scaleX: 1.1, duration: 0.2, ease: 'power2.out' })
      .to(arrow, { y: 3.2, scaleY: 1.22, scaleX: 0.88, duration: 0.17, ease: 'power3.in' })
      .addLabel('impact')
      // 착지: 화살표는 납작, 촉은 벌어지고, 바닥과 버튼이 눌린다
      .to(arrow, { scaleY: 0.74, scaleX: 1.15, duration: 0.07, ease: 'power2.out' }, 'impact')
      .to(head, { scaleX: 1.14, scaleY: 0.8, duration: 0.07, ease: 'power2.out' }, 'impact')
      .to(dip, { v: 1.1, duration: 0.07, ease: 'power2.out', onUpdate: drawTray }, 'impact')
      .to(btn, { scaleY: 0.95, scaleX: 1.03, duration: 0.07, ease: 'power2.out' }, 'impact')
      .addLabel('settle')
      // 반동: 스프링으로 출렁이다 멈춘다. 촉은 한 박자 늦게 따라온다
      .to(arrow, { y: 0, scaleX: 1, scaleY: 1, duration: 0.9, ease }, 'settle')
      .to(dip, { v: 0, duration: 1, ease, onUpdate: drawTray }, 'settle')
      .to(head, { scaleX: 1, scaleY: 1, duration: 0.8, ease }, 'settle+=0.06')
      .to(btn, { scaleX: 1, scaleY: 1, duration: 0.7, ease, clearProps: 'transform,transition' }, 'settle');

    const play = () => {
      if (!tl.isActive()) tl.restart();
    };
    btn.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'mouse') play();
    });
    btn.addEventListener('focus', () => {
      if (btn.matches(':focus-visible')) play();
    });
  });
}

/** 다운로드 수 카운트업 */
function counters() {
  const fmt = new Intl.NumberFormat('ko-KR');
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count);
    if (!Number.isFinite(target)) return;
    const obj = { v: 0 };
    gsap.to(obj, {
      v: target,
      duration: 1.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 92%' },
      onUpdate: () => {
        el.textContent = fmt.format(Math.round(obj.v));
      },
    });
  });
}
