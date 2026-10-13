/**
 * 스크롤·등장 연출. prefers-reduced-motion이면 아무것도 하지 않는다
 * (그 경우 CSS 폴백이 그대로 동작).
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduced) init();

function init() {
  gsap.registerPlugin(ScrollTrigger);

  // 관성 스크롤. ScrollTrigger와 같은 ticker를 쓰게 묶는다
  const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, anchors: { offset: -24 } });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  ignite();
  heroParallax();
  cards();
  shots();
  counters();
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
