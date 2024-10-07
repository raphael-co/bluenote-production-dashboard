import { useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';

export const useDynamicStyles = (markdownText: string, htmlContent: string, selectedFile: File | null, isEditMode: boolean) => {
    const { theme, collapsed } = useTheme();
    useEffect(() => {
        const applyStyles = () => {
            const inputSection = document.querySelector('.rc-md-editor .editor-container .sec-md .input') as HTMLElement;
            const htmlSection = document.querySelector('.rc-md-editor .editor-container .sec-html .html-wrap') as HTMLElement;
            const customHtml = document.querySelector('.custom-html-style') as HTMLElement;
            const customHead = document.querySelector('.rc-md-editor .rc-md-navigation') as HTMLElement;
            const customButtons = document.querySelectorAll('.rc-md-editor .rc-md-navigation .button-wrap .button') as NodeListOf<HTMLElement>;

            const customPre = document.querySelectorAll('.custom-html-style code, .custom-html-style pre') as NodeListOf<HTMLElement>;
            const customTh = document.querySelectorAll('.custom-html-style table th') as NodeListOf<HTMLElement>;
            const customP = document.querySelectorAll('.custom-html-style p') as NodeListOf<HTMLElement>;
            const customBlockquote = document.querySelectorAll('.custom-html-style blockquote') as NodeListOf<HTMLElement>;
            const customDropWrap = document.querySelectorAll('.rc-md-editor .drop-wrap') as NodeListOf<HTMLElement>;
            const customListItem = document.querySelectorAll('.rc-md-editor .header-list .list-item') as NodeListOf<HTMLElement>;

            const customPreTest = document.querySelectorAll('pre') as NodeListOf<HTMLElement>;

            // const headerElement = document.querySelector('.MuiAppBar-root') as HTMLElement;
            // const editor = document.querySelector('.rc-md-editor') as HTMLElement;

            // if (customHead && headerElement && editor) {

            //     const headerRect = headerElement.getBoundingClientRect();
            //     const customHeadRect = customHead.getBoundingClientRect();
            //     const editorRect = editor.getBoundingClientRect();

            //     customHead.style.transition = 'width 0.3s';
            //     if (customHeadRect.top <= headerRect.bottom && editorRect.top < headerRect.bottom) {
            //         if (collapsed) {
            //             customHead.style.width = 'calc(100% - ' + (collapsedDrawerWidth + 43) + 'px)';
            //             customHead.style.maxWidth = '100%';
            //             customHead.style.zIndex = '999';
            //         } else {
            //             customHead.style.width = 'calc(100% - ' + (drawerWidth + 43) + 'px)';
            //             customHead.style.maxWidth = '100%';
            //             customHead.style.zIndex = '999';
            //         }
            //     } else {
            //         if (collapsed) {
            //             customHead.style.width = '';
            //             customHead.style.maxWidth = '100%';
            //           } else {
            //             customHead.style.width = '';
            //             customHead.style.maxWidth = '100%';
            //           }

            //     }
            // }

            // const editorContainer = document.querySelector('.rc-md-editor .editor-container') as HTMLElement;

            if (customPreTest) {
                customPreTest.forEach((pre) => {
                    pre.style.backgroundColor = theme === 'dark' ? '#282828' : '#f5f5f5';
                });
            }

            if (customListItem) {
                customListItem.forEach((item) => {
                    item.addEventListener('mouseover', () => {
                        item.style.backgroundColor = '#e0e0e0';
                        item.style.color = '#333';
                    });

                    item.addEventListener('mouseout', () => {
                        item.style.backgroundColor = '';
                        item.style.color = '';
                    });
                });
            }

            if (customDropWrap) {
                customDropWrap.forEach((dropWrap) => {
                    dropWrap.style.backgroundColor = theme === 'dark' ? '#282828' : '#fff';
                    dropWrap.style.color = theme === 'dark' ? '#fff' : '#000';
                });
            }

            if (customBlockquote) {
                customBlockquote.forEach((blockquote) => {
                    blockquote.style.backgroundColor = theme === 'dark' ? '#282828' : '#f5f5f5';
                });
            }

            if (customP) {
                customP.forEach((p) => {
                    p.style.backgroundColor = 'transparent';
                    p.style.color = theme === 'dark' ? '#fff' : '#000';
                });
            }

            if (customTh) {
                customTh.forEach((th) => {
                    th.style.backgroundColor = theme === 'dark' ? '#282828' : '#f5f5f5';
                });
            }

            if (customPre) {
                customPre.forEach((pre) => {
                    pre.style.backgroundColor = theme === 'dark' ? '#282828' : '#f5f5f5';
                });
            }

            if (customButtons) {
                customButtons.forEach((button) => {
                    button.style.color = theme === 'dark' ? '#fff' : '#333';
                });
            }

            if (inputSection && htmlSection && customHtml && customHead && customDropWrap) {
                if (theme === 'dark') {
                    inputSection.style.backgroundColor = '#333';
                    inputSection.style.color = '#fff';
                    htmlSection.style.backgroundColor = '#333';
                    htmlSection.style.color = '#fff';
                    customHtml.style.color = '#fff';
                    customHead.style.backgroundColor = '#282828';
                } else {
                    inputSection.style.backgroundColor = '#fff';
                    inputSection.style.color = '#000';
                    htmlSection.style.backgroundColor = '#fff';
                    htmlSection.style.color = '#000';
                    customHtml.style.color = '#333';
                    customHead.style.backgroundColor = '#fff';
                }
            }
        };

        // Appel direct de applyStyles pour gérer les changements de React (dépendances)
        applyStyles();

        // Créer un MutationObserver pour surveiller les changements dans l'éditeur
        const observer = new MutationObserver(() => {
            applyStyles(); // Appliquer les styles lorsque des changements dans le DOM sont détectés
        });

        // Cibler le conteneur de l'éditeur Markdown
        const targetNode = document.querySelector('.rc-md-editor .editor-container');
        if (targetNode) {
            observer.observe(targetNode, { childList: true, subtree: true }); // Surveiller les modifications du DOM
        }

        // Nettoyage lorsque l'effet est désactivé ou lorsque le composant est démonté
        return () => {
            if (targetNode) {
                observer.disconnect(); // Arrêter d'observer
            }
        };
    }, [theme, markdownText, htmlContent, selectedFile, isEditMode, collapsed]);
};
