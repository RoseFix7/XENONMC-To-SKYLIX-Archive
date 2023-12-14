import TitleBarMode from './TitleBarMode';

export default interface Props {
    /**
     * Body content
     */
    children: JSX.Element | JSX.Element[];

    /**
     * Window title
     */
    title?: string;

    /**
     * The suffix for the title such as BETA, ALPHA or anything else
     */
    titleSuffix?: string;

    /**
     * Mode of the title bar
     */
    titleBarMode?: TitleBarMode;
}
