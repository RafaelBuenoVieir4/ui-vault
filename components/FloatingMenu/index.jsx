import {
  useEffect,
  useRef,
  useState,
} from "react";

import gsap from "gsap";

import {
  useGSAP,
} from "@gsap/react";

import {
  trackEvent,
} from "../../utils/analytics";

import {
  openWhatsApp,
} from "../../utils/whatsapp";

import "./styles.css";

gsap.registerPlugin(
  useGSAP
);


// =====================================
// LINKS
// =====================================

const links = [
  {
    number: "01",
    label: "Início",
    href: "#home",
    section: "home",
  },

  {
    number: "02",
    label: "Projetos",
    href: "#projects",
    section: "projects",
  },

  {
    number: "03",
    label: "Entrega",
    href: "#delivery",
    section: "delivery",
  },

  {
    number: "04",
    label: "Processo",
    href: "#process",
    section: "process",
  },

  {
    number: "05",
    label: "Time",
    href: "#team",
    section: "team",
  },

  {
    number: "06",
    label: "FAQ",
    href: "#faq",
    section: "faq",
  },

  {
    number: "07",
    label: "Contato",
    href: "#contact",
    section: "contact",
  },
];


function FloatingMenu() {

  /* =====================================
     STATE
  ===================================== */

  const [
    isOpen,
    setIsOpen,
  ] = useState(false);


  const [
    activeSection,
    setActiveSection,
  ] = useState("home");


  const buttonLabel =
    isOpen
      ? "Fechar"
      : "Menu";


  /* =====================================
     REFS
  ===================================== */

  const menuRef =
    useRef(null);

  const timelineRef =
    useRef(null);

  const buttonRef =
    useRef(null);

  const previousFocusRef =
    useRef(null);

  const isWavePlayingRef =
    useRef(false);

  const queuedWavesRef =
    useRef(0);


  /* =====================================
     CURRENT SECTION INDEX
  ===================================== */

  const activeIndex =
    Math.max(
      links.findIndex(
        (link) =>
          link.section ===
          activeSection
      ),
      0
    );


  const navigationStatus =
    `NAV / ${String(
      activeIndex + 1
    ).padStart(
      2,
      "0"
    )}—${String(
      links.length
    ).padStart(
      2,
      "0"
    )}`;


  /* =====================================
     MENU TIMELINE
  ===================================== */

  useGSAP(
    () => {

      gsap.set(
        ".floatingMenu__overlay",
        {
          autoAlpha:
            0,

          pointerEvents:
            "none",
        }
      );


      gsap.set(
        ".floatingMenu__panel",
        {
          xPercent:
            100,
        }
      );


      gsap.set(
        ".floatingMenu__link",
        {
          y:
            38,

          autoAlpha:
            0,
        }
      );


      gsap.set(
        ".floatingMenu__footer",
        {
          y:
            18,

          autoAlpha:
            0,
        }
      );


      timelineRef.current =
        gsap.timeline({
          paused:
            true,
        });


      timelineRef.current

        .to(
          ".floatingMenu__overlay",
          {
            autoAlpha:
              1,

            pointerEvents:
              "auto",

            duration:
              0.22,

            ease:
              "power2.out",
          }
        )

        .to(
          ".floatingMenu__panel",
          {
            xPercent:
              0,

            duration:
              0.62,

            ease:
              "power3.inOut",
          },
          0
        )

        .to(
          ".floatingMenu__link",
          {
            y:
              0,

            autoAlpha:
              1,

            duration:
              0.42,

            stagger:
              0.055,

            ease:
              "power3.out",
          },
          0.22
        )

        .to(
          ".floatingMenu__footer",
          {
            y:
              0,

            autoAlpha:
              1,

            duration:
              0.4,

            ease:
              "power3.out",
          },
          0.48
        );

    },
    {
      scope:
        menuRef,
    }
  );


  /* =====================================
     ACTIVE SECTION

     Uma faixa invisível atravessa
     aproximadamente o centro da tela.

     Quando uma seção passa por ela,
     vira a seção atual do menu.
  ===================================== */

  useEffect(() => {

    const sectionElements =
      links
        .map(
          (link) =>
            document.getElementById(
              link.section
            )
        )
        .filter(Boolean);


    if (
      sectionElements.length ===
      0
    ) {
      return;
    }


    /*
      Caso a página carregue diretamente
      com um hash.
    */

    const initialHash =
      window.location.hash
        .replace(
          "#",
          ""
        );


    if (
      links.some(
        (link) =>
          link.section ===
          initialHash
      )
    ) {
      setActiveSection(
        initialHash
      );
    }


    /*
      IntersectionObserver evita ficar
      calculando posição no scroll inteiro.

      Isso é especialmente interessante
      porque já temos bastante GSAP/Lenis.
    */

    const observer =
      new IntersectionObserver(
        (entries) => {

          const visibleEntries =
            entries.filter(
              (entry) =>
                entry.isIntersecting
            );


          if (
            visibleEntries.length ===
            0
          ) {
            return;
          }


          const referencePoint =
            window.innerHeight *
            0.4;


          visibleEntries.sort(
            (
              first,
              second
            ) => {

              const firstDistance =
                Math.abs(
                  first
                    .boundingClientRect
                    .top -
                  referencePoint
                );


              const secondDistance =
                Math.abs(
                  second
                    .boundingClientRect
                    .top -
                  referencePoint
                );


              return (
                firstDistance -
                secondDistance
              );
            }
          );


          const section =
            visibleEntries[0]
              .target
              .id;


          setActiveSection(
            section
          );
        },
        {
          /*
            Cria uma faixa de observação
            dentro da viewport.

            Não precisamos que metade
            inteira da seção esteja visível.
          */

          root:
            null,

          rootMargin:
            "-34% 0px -56% 0px",

          threshold:
            0,
        }
      );


    sectionElements.forEach(
      (section) => {
        observer.observe(
          section
        );
      }
    );


    return () => {
      observer.disconnect();
    };

  }, []);


  /* =====================================
     BUTTON WAVE
  ===================================== */

  function playButtonWave() {

    if (
      !buttonRef.current
    ) {
      return;
    }


    if (
      isWavePlayingRef.current
    ) {
      queuedWavesRef.current +=
        1;

      return;
    }


    isWavePlayingRef.current =
      true;


    const tracks =
      buttonRef.current
        .querySelectorAll(
          ".floatingMenu__letterTrack"
        );


    const wave =
      gsap.timeline({
        onComplete:
          () => {

            gsap.set(
              tracks,
              {
                yPercent:
                  0,

                opacity:
                  1,
              }
            );


            isWavePlayingRef.current =
              false;


            if (
              queuedWavesRef.current >
              0
            ) {

              queuedWavesRef.current -=
                1;

              playButtonWave();
            }
          },
      });


    tracks.forEach(
      (
        track,
        index
      ) => {

        const delay =
          index *
          0.035;


        wave.to(
          track,
          {
            yPercent:
              -20,

            opacity:
              0.45,

            duration:
              0.12,

            ease:
              "power2.in",
          },
          delay
        );


        wave.to(
          track,
          {
            yPercent:
              -50,

            opacity:
              1,

            duration:
              0.32,

            ease:
              "power3.out",
          },
          delay +
            0.08
        );

      }
    );

  }


  function handleButtonHover() {
    playButtonWave();
  }


  /* =====================================
     OPEN
  ===================================== */

  function openMenu() {

    /*
      Guardamos de onde o usuário veio.
      Útil para devolver o foco depois.
    */

    previousFocusRef.current =
      document.activeElement;


    setIsOpen(
      true
    );


    timelineRef.current
      ?.play();

  }


  /* =====================================
     CLOSE
  ===================================== */

  function closeMenu(
    restoreFocus = true
  ) {

    setIsOpen(
      false
    );


    timelineRef.current
      ?.reverse();


    if (
      restoreFocus
    ) {

      requestAnimationFrame(
        () => {

          /*
            O botão permanece visível
            durante todo o site.

            Ele é um ponto seguro para
            devolver o foco.
          */

          buttonRef.current
            ?.focus({
              preventScroll:
                true,
            });

        }
      );

    }

  }


  /* =====================================
     FOCUS TRAP + ESC
  ===================================== */

  useEffect(() => {

    if (
      !isOpen
    ) {
      return;
    }


    const root =
      menuRef.current;


    if (
      !root
    ) {
      return;
    }


    const selector = [
      "a[href]",
      "button:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");


    /*
      Quando o menu abre, o foco vai
      preferencialmente para a seção
      em que o visitante já está.
    */

    const focusTimer =
      window.setTimeout(
        () => {

          const activeLink =
            root.querySelector(
              `.floatingMenu__link[data-section="${activeSection}"]`
            );


          const firstLink =
            root.querySelector(
              ".floatingMenu__link"
            );


          (
            activeLink ||
            firstLink
          )?.focus({
            preventScroll:
              true,
          });

        },
        260
      );


    function handleKeyDown(
      event
    ) {

      /* ESC */

      if (
        event.key ===
        "Escape"
      ) {

        event.preventDefault();

        closeMenu(
          true
        );

        return;
      }


      /* TAB */

      if (
        event.key !==
        "Tab"
      ) {
        return;
      }


      const focusableElements =
        Array.from(
          root.querySelectorAll(
            selector
          )
        ).filter(
          (element) => {

            const styles =
              window.getComputedStyle(
                element
              );


            return (
              styles.display !==
                "none" &&
              styles.visibility !==
                "hidden"
            );

          }
        );


      if (
        focusableElements.length ===
        0
      ) {
        return;
      }


      const firstElement =
        focusableElements[0];

      const lastElement =
        focusableElements[
          focusableElements.length -
          1
        ];


      /*
        SHIFT + TAB no primeiro:
        volta para o último.
      */

      if (
        event.shiftKey &&
        document.activeElement ===
          firstElement
      ) {

        event.preventDefault();

        lastElement.focus();

        return;
      }


      /*
        TAB no último:
        volta para o primeiro.
      */

      if (
        !event.shiftKey &&
        document.activeElement ===
          lastElement
      ) {

        event.preventDefault();

        firstElement.focus();
      }

    }


    document.addEventListener(
      "keydown",
      handleKeyDown
    );


    return () => {

      window.clearTimeout(
        focusTimer
      );


      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

    };

  }, [
    isOpen,
    activeSection,
  ]);


  /* =====================================
     NAVIGATION
  ===================================== */

  function handleNavigation(
    link
  ) {

    trackEvent(
      "menu_navigation",
      {
        location:
          "floating_menu",

        section_name:
          link.section,
      }
    );


    closeMenu(
      true
    );

  }


  /* =====================================
     WHATSAPP
  ===================================== */

  function handleWhatsAppClick() {

    trackEvent(
      "whatsapp_click",
      {
        location:
          "floating_menu",
      }
    );


    closeMenu(
      true
    );


    openWhatsApp(
      "Olá, BELVIERE! Conheci vocês pelo site e gostaria de conversar sobre um projeto para minha clínica."
    );

  }


  /* =====================================
     RENDER
  ===================================== */

  return (
    <div
      className="floatingMenu"
      ref={menuRef}
    >

      {/* =================================
          FIXED BUTTON
      ================================= */}

      <button
        ref={buttonRef}

        type="button"

        className={`
          floatingMenu__button
          ${
            isOpen
              ? "is-open"
              : ""
          }
        `}

        onPointerEnter={
          handleButtonHover
        }

        onClick={() => {
          if (
            isOpen
          ) {
            closeMenu(
              true
            );
          } else {
            openMenu();
          }
        }}

        aria-label={
          isOpen
            ? "Fechar menu"
            : "Abrir menu"
        }

        aria-expanded={
          isOpen
        }

        aria-controls="floating-menu-panel"
      >

        <span
          className="floatingMenu__buttonWord"

          style={{
            "--letter-count":
              buttonLabel.length,
          }}
        >

          {buttonLabel
            .split("")
            .map(
              (
                letter,
                index
              ) => (

                <span
                  className="floatingMenu__letter"

                  key={`${letter}-${index}`}

                  style={{
                    "--letter-index":
                      index,
                  }}
                >

                  <span className="floatingMenu__letterTrack">

                    <span>
                      {letter}
                    </span>

                    <span
                      aria-hidden="true"
                    >
                      {letter}
                    </span>

                  </span>

                </span>

              )
            )}

        </span>

      </button>


      {/* =================================
          OVERLAY
      ================================= */}

      <div
        className="floatingMenu__overlay"

        aria-hidden={
          !isOpen
        }

        onClick={() =>
          closeMenu(
            true
          )
        }
      >

        {/* ===============================
            PANEL
        =============================== */}

        <aside
          id="floating-menu-panel"

          className="floatingMenu__panel"

          role="dialog"

          aria-modal="true"

          aria-label="Menu principal"

          onClick={(
            event
          ) =>
            event.stopPropagation()
          }
        >

          {/* =============================
              HEADER
          ============================= */}

          <div className="floatingMenu__header">

            <span className="floatingMenu__logo">
              BELVIERE
            </span>


            <span className="floatingMenu__headerMeta">
              {
                navigationStatus
              }
            </span>

          </div>


          {/* =============================
              NAVIGATION
          ============================= */}

          <nav
            className="floatingMenu__nav"

            aria-label="Navegação rápida"
          >

            {links.map(
              (
                link
              ) => {

                const isActive =
                  activeSection ===
                  link.section;


                return (
                  <a
                    className={`
                      floatingMenu__link
                      ${
                        isActive
                          ? "is-active"
                          : ""
                      }
                    `}

                    href={
                      link.href
                    }

                    data-section={
                      link.section
                    }

                    key={
                      link.href
                    }

                    aria-current={
                      isActive
                        ? "location"
                        : undefined
                    }

                    onClick={() =>
                      handleNavigation(
                        link
                      )
                    }
                  >

                    <span className="floatingMenu__linkNumber">
                      {
                        link.number
                      }
                    </span>


                    <strong>
                      {
                        link.label
                      }
                    </strong>


                    <span
                      className="floatingMenu__linkArrow"
                      aria-hidden="true"
                    >
                      ↘
                    </span>

                  </a>
                );

              }
            )}

          </nav>


          {/* =============================
              FOOTER
          ============================= */}

          <div className="floatingMenu__footer">

            <div className="floatingMenu__footerMeta">

              <span>
                NOVOS PROJETOS
              </span>

              <span>
                DISPONÍVEL
              </span>

            </div>


            <button
              type="button"

              className="floatingMenu__cta"

              onClick={
                handleWhatsAppClick
              }
            >

              <span>
                FALAR COM A BELVIERE
              </span>


              <strong
                aria-hidden="true"
              >
                ↗
              </strong>

            </button>

          </div>

        </aside>

      </div>

    </div>
  );

}


export default FloatingMenu;