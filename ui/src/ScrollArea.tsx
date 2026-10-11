import type {HTMLAttributes} from 'react';
/** Shared HAS-A scrolling policy; root document uses the same stable gutter. */
export function ScrollArea({className='',...props}:HTMLAttributes<HTMLDivElement>){return <div {...props} className={`scroll-viewport ${className}`}/>;}
