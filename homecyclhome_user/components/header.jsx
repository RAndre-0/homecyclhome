import { NavigationMenuDemo } from "@/components/header-navigation";
import Image from "next/image";
import logo from "../public/media/image/logo_homecyclhome_grayscale.png";
import Link from 'next/link';

export default function Header() {
    return (
        <header className="flex justify-between items-center p-4">
            <Link href="/">
                <Image
                    src={logo}
                    alt="Logo HomeCyclHome"
                    width={256}
                />
            </Link>
            <NavigationMenuDemo />
        </header>
    );
}
