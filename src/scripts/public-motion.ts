import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (document.documentElement.dataset.motionScope === 'public') {
	const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
	let reduceMotion = motionPreference.matches;

	gsap.registerPlugin(ScrollTrigger);

	const motionSelector = [
		'[data-motion-reveal]',
		'[data-motion-hero]',
		'[role="tabpanel"]',
		'.card',
		'.lesson-card',
		'.prose',
		'.toast .alert',
		'footer',
	].join(', ');
	const initializedTargets = new Set<HTMLElement>();
	const revealTriggers: Array<{ kill: () => void }> = [];

	const clearMotionStyles = () => {
		revealTriggers.forEach((trigger) => trigger.kill());
		revealTriggers.length = 0;
		document.querySelectorAll<HTMLElement>('.gsap-motion-item').forEach((element) => {
			gsap.killTweensOf(element);
			element.style.removeProperty('opacity');
			element.style.removeProperty('visibility');
			element.style.removeProperty('--gsap-motion-y');
			element.style.removeProperty('--gsap-motion-scale');
		});
		initializedTargets.clear();
	};

	const revealWithin = (root: ParentNode) => {
		if (reduceMotion) return;

		const candidates = Array.from(root.querySelectorAll<HTMLElement>(motionSelector));
		if (root instanceof HTMLElement && root.matches(motionSelector)) candidates.unshift(root);
		const targets = candidates.filter((element) => {
			if (
				element.closest('.hidden, [hidden]') ||
				!element.getClientRects().length ||
				initializedTargets.has(element)
			) return false;

			const parentMotionTarget = element.parentElement?.closest(motionSelector);
			return !parentMotionTarget;
		});

		targets.forEach((element, index) => {
			element.classList.add('gsap-motion-item');
			initializedTargets.add(element);
			gsap.set(element, { autoAlpha: 0, '--gsap-motion-y': '8px' });

			const trigger = ScrollTrigger.create({
				trigger: element,
				start: 'top 88%',
				once: true,
				onEnter: () => {
					gsap.to(element, {
						autoAlpha: 1,
						'--gsap-motion-y': '0px',
						duration: 0.62,
						delay: (index % 3) * 0.035,
						ease: 'power2.out',
						overwrite: 'auto',
						onComplete: () => {
							element.style.removeProperty('opacity');
							element.style.removeProperty('visibility');
						},
					});
				},
			});
			revealTriggers.push(trigger);
		});
	};

	if (!reduceMotion) {
		const headerItems = document.querySelectorAll<HTMLElement>(
			'header.navbar .navbar-start, header.navbar .navbar-center, header.navbar .navbar-end',
		);

		headerItems.forEach((element) => element.classList.add('gsap-motion-item'));
		gsap.fromTo(
			headerItems,
			{ autoAlpha: 0, '--gsap-motion-y': '-5px' },
			{
				autoAlpha: 1,
				'--gsap-motion-y': '0px',
				duration: 0.55,
				stagger: 0.075,
				ease: 'power2.out',
				overwrite: 'auto',
			},
		);

		revealWithin(document);

		const gridButton = document.getElementById('btnGridView');
		const gridView = document.getElementById('gridView');
		gridButton?.addEventListener('click', () => {
			window.setTimeout(() => {
				if (gridView && !gridView.classList.contains('hidden')) revealWithin(gridView);
				ScrollTrigger.refresh();
			}, 0);
		});
		document.querySelectorAll<HTMLInputElement>('input[role="tab"]').forEach((tab) => {
			tab.addEventListener('change', () => {
				if (tab.checked && tab.nextElementSibling) revealWithin(tab.nextElementSibling);
				ScrollTrigger.refresh();
			});
		});

		const interactiveSelector =
			'button, input[role="tab"], a.btn, .tab, header.navbar a, .menu a, .mobile-nav-link, footer a, .lesson-card, [data-motion-interactive]';
		const interactiveElements = document.querySelectorAll<HTMLElement>(interactiveSelector);

		// Prepara el transform antes del primer hover para evitar el salto de composición inicial.
		interactiveElements.forEach((element) => {
			element.classList.add('gsap-motion-item');
			gsap.set(element, {
				'--gsap-motion-y': '0px',
				'--gsap-motion-scale': '1',
			});
		});

		const animateInteraction = (element: HTMLElement, state: 'rest' | 'hover' | 'press') => {
			if (reduceMotion) return;

			const isCard = element.matches('.lesson-card, [data-motion-interactive]');
			const scale = state === 'press' ? '0.992' : '1';
			const y = state === 'press' ? '0px' : state === 'hover' ? (isCard ? '-2px' : '-1px') : '0px';

			gsap.to(element, {
				'--gsap-motion-y': y,
				'--gsap-motion-scale': scale,
				duration: state === 'press' ? 0.12 : 0.24,
				ease: state === 'rest' ? 'power2.out' : 'power2.inOut',
				overwrite: 'auto',
			});
		};

		const findInteractive = (target: EventTarget | null) =>
			target instanceof Element ? target.closest<HTMLElement>(interactiveSelector) : null;

		document.addEventListener('pointerover', (event) => {
			if (event.pointerType === 'touch') return;
			const element = findInteractive(event.target);
			if (!element || (event.relatedTarget instanceof Node && element.contains(event.relatedTarget))) return;
			animateInteraction(element, 'hover');
		});

		document.addEventListener('pointerout', (event) => {
			if (event.pointerType === 'touch') return;
			const element = findInteractive(event.target);
			if (!element || (event.relatedTarget instanceof Node && element.contains(event.relatedTarget))) return;
			animateInteraction(element, element.matches(':focus-visible') ? 'hover' : 'rest');
		});

		document.addEventListener('pointerdown', (event) => {
			const element = findInteractive(event.target);
			if (element) animateInteraction(element, 'press');
		});

		document.addEventListener('pointerup', (event) => {
			const element = findInteractive(event.target);
			if (element) animateInteraction(element, element.matches(':hover') ? 'hover' : 'rest');
		});

		document.addEventListener('focusin', (event) => {
			const element = findInteractive(event.target);
			if (element) animateInteraction(element, 'hover');
		});

		document.addEventListener('focusout', (event) => {
			const element = findInteractive(event.target);
			if (element) animateInteraction(element, element.matches(':hover') ? 'hover' : 'rest');
		});

		const overlay = document.getElementById('mobile-menu-overlay');
		const openMenuButton = document.getElementById('mobile-menu-open-btn');
		const closeMenuButton = document.getElementById('mobile-menu-close-btn');
		const mobileLinks = overlay?.querySelectorAll<HTMLElement>('.mobile-nav-link');
		mobileLinks?.forEach((element) => element.classList.add('gsap-motion-item'));

		openMenuButton?.addEventListener('click', () => {
			if (!mobileLinks?.length) return;
			gsap.fromTo(
				mobileLinks,
				{ autoAlpha: 0, '--gsap-motion-y': '5px' },
				{
					autoAlpha: 1,
					'--gsap-motion-y': '0px',
					duration: 0.32,
				stagger: 0.06,
				delay: 0.08,
					ease: 'power2.out',
					overwrite: 'auto',
				},
			);
		});

		closeMenuButton?.addEventListener('click', () => {
			if (!mobileLinks?.length) return;
			gsap.to(mobileLinks, {
				autoAlpha: 0,
				'--gsap-motion-y': '3px',
				duration: 0.2,
				stagger: { each: 0.025, from: 'end' },
				overwrite: 'auto',
			});
		});
	}

	motionPreference.addEventListener('change', (event) => {
		reduceMotion = event.matches;
		if (reduceMotion) clearMotionStyles();
	});
}
