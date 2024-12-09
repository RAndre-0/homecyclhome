import { NavigationMenuDemo } from "@/components/header-navigation";
import Image from "next/image";
import logo from "../public/media/image/logo.png";
import Link from 'next/link';

export default function Header() {
    return (
        <header>
            <Link href="/">
                <Image
                    src={logo}
                    alt="Photo by Drew Beamer"
                    className="size-16"
                />
            </Link>
            <NavigationMenuDemo />
        </header>
    );
}