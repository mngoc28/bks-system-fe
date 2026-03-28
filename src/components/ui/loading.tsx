import { Atom, Commet, ThreeDot, } from "react-loading-indicators"
import { LoadingProps } from "../type"

export const LoadingAtom: React.FC<LoadingProps> = ({ color = '#064F80', size = 'medium' }) => {
    return (
        <div className="fixed z-[100] inset-0 bg-black/80">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" >
                <Atom color={color} size={size} text="" textColor="" />
            </div>
        </div>
    )
}

export const LoadingThreeDot: React.FC<LoadingProps> = ({ color = '#064F80', size = 'medium' }) => {
    return (
        <div className="fixed z-[100] inset-0 bg-black/80">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" >
                <ThreeDot variant="bounce" color={color} size={size} text="" textColor="" />
            </div>
        </div>
    )
}

export const LoadingCommet: React.FC<LoadingProps> = ({ color = '#064F80', size = 'medium' }) => {
    return (
        <div className="fixed z-[100] inset-0 bg-black/80">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" >
                <Commet color={color} size={size} text="" textColor="" />
            </div>
        </div>
    )
}


