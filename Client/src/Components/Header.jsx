import React from 'react'
import { FaLinkedin, FaGithub } from 'react-icons/fa';

const Header = () => {
    return (
        <div className="bg-gray-950 text-white p-4 flex items-center justify-between border-b border-gray-700">
            <div>
                <p className="text-2xl font-bold text-orange-400">RAG Application</p>
                <p className="text-sm text-gray-300">
                    Upload documents, scrape websites, and chat with your data using AI
                </p>
            </div>
            <div className="flex gap-4 text-2xl">
                <a
                    href="https://www.linkedin.com/in/vishwassinhvihol/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-400 transition"
                >
                    <FaLinkedin />
                </a>
                <a
                    href="https://github.com/VishvassinhVihol"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-400 transition"
                >
                    <FaGithub />
                </a>
            </div>
        </div>
    )
}

export default Header;
