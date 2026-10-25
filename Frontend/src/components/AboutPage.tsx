import React from 'react';
import Header from './Header';
import Footer from './Footer';
import {
    Code2,
    MapPin,
    Briefcase,
    Zap,
    Linkedin,
    ArrowRight,
    Cpu,
    Activity,
    ShieldCheck,
    Globe,
    GitBranch,
    Layers,
    CheckCircle2,
    Github
} from 'lucide-react';

interface AboutPageProps {
    onGoBack: () => void;
    onOpenProfile?: () => void;
}
const AboutPage: React.FC<AboutPageProps> = ({ onGoBack, onOpenProfile }) => {

    // --- TEAM DATA ---
    const team = [
        {
            name: "Kartik D. Parmar",
            role: "Founder & Architect",
            location: "Mumbai HQ",
            desc: "The mastermind behind the business and the flow. Driving smooth operations and maintaining steady workflow and made a seamless digital infrastructure.",
            specialty: "Full Stack Arch",
            stat_label: "Commits",
            stat_value: "5k+",
            image: "/Kartik.jpeg",
            icon: <Code2 className="w-8 h-8 text-[#80ED99]" />,
            links: { linkedin: "https://www.linkedin.com/in/parmarkartik385/", github: "https://github.com/385Kartik", portfolio: "https://my-portfolio-f96fe.firebaseapp.com/" }
        },
        {
            name: "Mahek Shah",
            role: "Co-Founder and Operations Director",
            location: "On-Field",
            desc: "The backbone of logistics. Driving smooth operations and maintaining steady workflow",
            specialty: "Manager",
            stat_label: "Uptime",
            stat_value: "99.9%",
            image: "/Mahek.jpg",
            icon: <Briefcase className="w-8 h-8 text-[#80ED99]" />,
            links: { linkedin: "https://www.linkedin.com/in/mahek-shah-04b792227/", github: "https://github.com/395Mahek", portfolio: "" }
        },
        {
            name: "Yash Prajapati",
            role: "Lead Backend Developer",
            location: "Server Room",
            desc: "Guardian of the vault. Builts protocols that keep every assignment confidential and a lead backend developer.",
            specialty: "Full Stack Developer",
            stat_label: "Encryption",
            stat_value: "AES-256",
            image: "/Yash.png",
            icon: <ShieldCheck className="w-8 h-8 text-[#80ED99]" />,
            links: { linkedin: "https://www.linkedin.com/in/prajapatiyash7", github: "https://github.com/Yash-Prajapati7", portfolio: "https://yaash.dev/" }
        },
        
    ];

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-gray-900 selection:bg-[#80ED99] selection:text-black">

            <Header onPrimaryAction={onGoBack} onUserAction={onOpenProfile} />

            {/* --- 1. HERO SECTION --- */}
            <div className="pt-40 pb-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-100 relative overflow-hidden rounded-b-[3rem] z-20">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#80ED99]/5 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-100 text-[10px] font-bold mb-8 uppercase tracking-[0.2em] text-gray-400 animate-fade-in-up">
                        <Zap className="w-3 h-3 text-[#80ED99] fill-current" />
                        <span>System Status: Optimal</span>
                    </div>

                    <h1 className="text-6xl md:text-9xl font-extrabold mb-8 tracking-tighter leading-[0.9] text-black">
                        BUILT BY <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#80ED99] to-emerald-600">
                            ENGINEERS.
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed mb-7">
                        Four students. One annoying queue. <br />
                        <span className="text-black">We wrote code to solve a real problem.</span>
                    </p>
                </div>
            </div>

           




























{/* =========================================
    2. STORY SECTION (The Floating Monolith - Red/Yellow/Green Static)
   ========================================= */}
<div className="relative z-30 -mt-20 px-4 sm:px-6 lg:px-8 pb-32">
    
    {/* --- THE FLOATING MONOLITH --- */}
    <div className="max-w-7xl mx-auto bg-[#080808] rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-gray-800 overflow-hidden relative">
        
        {/* Top Highlight (Glow) */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[700px]">
            
            {/* LEFT SIDE: STATIC HEADER (Sticky Feel) */}
            <div className="lg:col-span-5 p-10 md:p-16 bg-[#0a0a0a] border-b lg:border-b-0 lg:border-r border-gray-800 flex flex-col justify-between relative overflow-hidden">
                
                {/* Background Noise */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>

                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#80ED99]/5 text-[#80ED99] text-[10px] font-bold uppercase tracking-[0.2em] mb-8 border border-[#80ED99]/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#80ED99] animate-pulse"></span>
                        System Logs
                    </div>
                    
                    <h2 className="text-4xl md:text-6xl font-black text-white leading-[0.9] tracking-tighter mb-6">
                        WE HACKED <br/>
                        THE <span className="text-transparent bg-clip-text bg-gradient-to-br from-red-200 to-red-600">QUEUE.</span>
                    </h2>
                    <p className="text-gray-500 font-medium text-sm leading-relaxed max-w-xs">
                        Refactoring the printing process from the ground up.
                    </p>
                </div>

                {/* Decorative Tech Specs */}
                <div className="hidden lg:block space-y-4 opacity-30">
                     <div className="h-[1px] w-full bg-gray-700"></div>
                     <div className="flex justify-between text-[10px] font-mono uppercase text-gray-500">
                         <span>ERR: 404 (Queue)</span>
                         <span>Latency: 0ms</span>
                     </div>
                </div>
            </div>

            {/* RIGHT SIDE: THE STORY TIMELINE */}
            <div className="lg:col-span-7 p-10 md:p-16 relative">
                
                {/* The Timeline Line */}
                <div className="absolute left-8 md:left-14 top-0 bottom-0 w-[1px] bg-gray-800/50"></div>

                <div className="space-y-20 relative z-10">

                    {/* ITEM 01: THE ERROR (Red) */}
                    <div className="relative pl-12 md:pl-16">
                        {/* Timeline Dot */}
                        <div className="absolute left-[-5px] md:left-[1px] top-2 w-3 h-3 bg-[#080808] border-2 border-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)]"></div>
                        
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-red-500 font-mono text-xs font-bold uppercase tracking-wider">Critical Failure</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">The 8:50 AM Panic</h3>
                        <p className="text-gray-400 leading-relaxed text-lg">
                            Assignment due at 9:00. Queue of 40 people. <br/>
                            The heat. The noise. The <span className="text-red-400">"Pendrive Corrupted", "No Internet At Repogarphy Center :)"</span> error. <br/>
                            We realized standing in line for 45 minutes for a single page wasn't just annoying; it was a system crash.
                        </p>
                    </div>

                    {/* ITEM 02: THE PATCH (Yellow/Amber) */}
                    <div className="relative pl-12 md:pl-16">
                        {/* Timeline Dot */}
                        <div className="absolute left-[-5px] md:left-[1px] top-2 w-3 h-3 bg-[#080808] border-2 border-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>
                        
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-amber-500 font-mono text-xs font-bold uppercase tracking-wider">Deploying Patch</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">The Cloud Logic</h3>
                        <p className="text-gray-400 leading-relaxed text-lg">
                            Why physically carry files in a digital age? <br/>
                            We built a bridge: <strong>Laptop ➔ Cloud ➔ Printer.</strong> <br/>
                            No pendrives. No pairing. Just upload from your room and <span className="text-amber-400">bypass the bottleneck</span>.
                        </p>
                    </div>

                    {/* ITEM 03: THE OPTIMIZATION (Green - Highlighted) */}
                    <div className="relative pl-12 md:pl-16">
                        {/* Timeline Dot */}
                        <div className="absolute left-[-5px] md:left-[1px] top-8 w-3 h-3 bg-[#80ED99] rounded-full animate-pulse shadow-[0_0_20px_#80ED99]"></div>
                        
                        {/* Highlighted Box */}
                        <div className="bg-[#111] border border-[#80ED99]/30 p-8 rounded-2xl shadow-[0_0_30px_rgba(128,237,153,0.05)] relative overflow-hidden">
                             
                             {/* Green Gradient Splash */}
                             <div className="absolute top-0 right-0 w-40 h-40 bg-[#80ED99]/5 blur-3xl rounded-full pointer-events-none"></div>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="px-2 py-0.5 rounded bg-[#80ED99]/10 border border-[#80ED99]/20 text-[#80ED99] text-[10px] font-bold uppercase tracking-wider">
                                    System Optimized
                                </div>
                            </div>

                            <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
                                The <span className="text-[#80ED99]">Win-Win</span> Protocol
                            </h3>
                           <p className="text-gray-400 leading-relaxed text-lg">
            We automated the shop owner's workflow. No virus-filled pendrives. No manual file searching. We save <i>them</i> significant man-hours. Also giving significantly <span className="text-white font-bold border-b border-[#80ED99]/50">lower rates</span> + <span className="text-white font-bold border-b border-[#80ED99]/50">tokens</span>.
        </p>
        
        {/* The Result */}
        <div className="mt-6 flex items-center gap-3 bg-[#80ED99]/5 p-3 rounded-lg border border-[#80ED99]/10 w-fit">
            <Zap className="w-5 h-5 text-[#80ED99] fill-current" />
            <span className="text-white font-bold text-sm tracking-wide">
                Exclusive PrintIt Discounts Applied.
            </span>
        </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</div>




























    {/* --- 3. THE SQUAD (With Image Links) --- */ }
    < div className = "py-24 px-4 sm:px-6 lg:px-8 bg-[#050505] relative border-t border-gray-900" >

        <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-24">
                <span className="text-[#80ED99] font-mono text-xs font-bold uppercase tracking-[0.3em] border border-[#80ED99]/30 px-4 py-2 rounded-full">
                    The Kernel
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-white mt-8 tracking-tight">
                    MEET THE ARCHITECTS
                </h2>
            </div>

            <div className="flex flex-col gap-16">
                {team.map((member, idx) => (

                    <div
                        key={idx}
                        className={`bg-[#111] rounded-[3rem] border border-gray-800 p-8 md:p-12 flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 items-center hover:border-[#80ED99]/40 transition-colors duration-500 shadow-2xl group`}
                    >

                        {/* 1. PHOTO SECTION */}
                        <div className="w-full md:w-5/12 aspect-square shrink-0 bg-[#1a1a1a] rounded-[2.5rem] overflow-hidden relative border border-gray-800 shadow-inner group-hover:shadow-[0_0_30px_rgba(128,237,153,0.05)] transition-all">

                            {/* IMAGE LOGIC: If image exists, show it. Else show placeholder icon. */}
                            {member.image ? (
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-700">
                                    <div className="p-4 bg-black/40 rounded-2xl mb-4 text-[#80ED99]">
                                        {member.icon}
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest font-mono">IMG MISSING</span>
                                </div>
                            )}

                            {/* Tag */}
                            <div className="absolute bottom-6 left-6 right-6 bg-[#80ED99] text-black text-[10px] font-bold py-2 rounded-xl text-center uppercase tracking-wider shadow-lg">
                                {member.role}
                            </div>
                        </div>

                        {/* 2. DETAILS SECTION */}
                        <div className="w-full md:w-7/12 text-left">

                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-500 font-mono text-xs uppercase tracking-[0.2em]">0{idx + 1}</span>
                                    <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                                        {member.name}
                                    </h3>
                                </div>

                                {/* SOCIAL LINKS */}
                                <div className="flex gap-3">
                                    <a href={member.links.github} className="p-2.5 rounded-full bg-[#1a1a1a] text-gray-400 hover:bg-white hover:text-black transition-all border border-gray-800">
                                        <Github className="w-5 h-5" />
                                    </a>
                                    <a href={member.links.linkedin} className="p-2.5 rounded-full bg-[#1a1a1a] text-gray-400 hover:bg-[#0077b5] hover:text-white transition-all border border-gray-800">
                                        <Linkedin className="w-5 h-5" />
                                    </a>
                                    <a href={member.links.portfolio} className="p-2.5 rounded-full bg-[#1a1a1a] text-gray-400 hover:bg-[#80ED99] hover:text-black transition-all border border-gray-800">
                                        <Globe className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>

                            <p className="text-gray-400 text-lg leading-relaxed mb-10 pl-6 border-l-2 border-[#80ED99]">
                                {member.desc}
                            </p>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-8 mb-10 bg-[#161616] p-6 rounded-3xl border border-gray-800/50">
                                <div>
                                    <p className="text-gray-500 text-[10px] uppercase font-bold mb-2 tracking-widest">{member.stat_label}</p>
                                    <p className="text-white font-bold text-xl flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-[#80ED99]" /> {member.stat_value}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-[10px] uppercase font-bold mb-2 tracking-widest">Specialty</p>
                                    <p className="text-white font-bold text-xl flex items-center gap-2">
                                        <Cpu className="w-4 h-4 text-[#80ED99]" /> {member.specialty}
                                    </p>
                                </div>
                            </div>

                            <div className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 bg-black px-4 py-2 rounded-full border border-gray-800">
                                <MapPin className="w-3 h-3 text-[#80ED99]" /> {member.location}
                            </div>
                        </div>

                    </div>
                ))}
            </div>

        </div>
            </div >

    {/* --- 4. THE VISION --- */ }
    < div className = "py-32 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden border-t border-gray-100 rounded-t-[3rem] mt-[-3rem] z-10" >
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
                <span className="bg-gray-100 text-black px-4 py-2 rounded-full font-mono text-xs font-bold uppercase tracking-widest border border-gray-200">
                    The Blueprint
                </span>
                <h2 className="text-4xl md:text-6xl font-black mt-8 tracking-tighter text-black">
                    WHY WE BUILT <span className="text-[#80ED99] bg-black px-2">PrintIt.</span>
                </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
                <div>
                    <h3 className="text-3xl font-black mb-6 flex items-center gap-3">
                        <GitBranch className="w-8 h-8 text-black" /> The Vision
                    </h3>
                    <p className="text-xl font-medium text-gray-500 leading-relaxed mb-8">
                        We believe that <span className="text-black font-bold">Time is currency</span>.
                        Standing in a queue for 45 minutes to print a 2-page assignment is an engineering failure.
                    </p>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-6 h-6 text-[#80ED99] shrink-0 fill-black" />
                            <span className="font-medium text-gray-700">Democratize high-speed printing.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-6 h-6 text-[#80ED99] shrink-0 fill-black" />
                            <span className="font-medium text-gray-700">Eliminate pendrives & cash.</span>
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-3xl font-black mb-6 flex items-center gap-3">
                        <Layers className="w-8 h-8 text-black" /> How We Did It
                    </h3>
                    <p className="text-lg text-gray-600 leading-relaxed mb-8">
                        We bridged the gap between legacy hardware and cloud software. A <strong>Hybrid Infrastructure</strong> that feels like magic.
                    </p>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <Globe className="w-8 h-8 text-black mb-4" />
                            <h4 className="font-bold mb-2">Cloud First</h4>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <ShieldCheck className="w-8 h-8 text-black mb-4" />
                            <h4 className="font-bold mb-2">Secure Vault</h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>
            </div >

    {/* --- 5. PARTNER SECTION --- */ }
{/* --- 5. PARTNER SECTION (Clean Split Layout) --- */ }
<div className="py-32 px-4 sm:px-6 lg:px-8 bg-[#050505] text-white relative overflow-hidden border-t border-gray-900 rounded-t-[3rem] mt-[-3rem] z-20">
    <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
            <span className="text-[#80ED99] font-mono text-xs font-bold uppercase tracking-[0.3em] border border-[#80ED99]/30 px-4 py-2 rounded-full">
                Infrastructure
            </span>
            <h2 className="text-4xl md:text-6xl font-black mt-8 tracking-tight text-white">
                PRINTING PARTNER
            </h2>
        </div>

        {/* MAIN CARD - SPLIT LAYOUT (No Overlap) */}
        <div className="bg-[#111] rounded-[2.5rem] border border-gray-800 overflow-hidden flex flex-col md:flex-row hover:border-[#80ED99]/50 transition-all duration-500 shadow-2xl group">
            
            {/* === LEFT: PHOTO SECTION (Clean, No Text Overlay) === */}
            <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-[#0a0a0a] border-b md:border-b-0 md:border-r border-gray-800">
                <img 
                    src="/Krishna_Xerox.jpeg" 
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" 
                    alt="Krishna Xerox Shop"
                />
                
                {/* Badge floating nicely at top-left, not covering main content */}
                <div className="absolute top-4 left-4 bg-[#80ED99] text-black px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider shadow-lg z-10">
                    Official Partner
                </div>
            </div>

            {/* === RIGHT: CONTENT SECTION (Clean Black Background) === */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-[#80ED99]/10 p-2 rounded-lg text-[#80ED99] border border-[#80ED99]/20">
                        <Globe className="w-5 h-5" />
                    </div>
                    <span className="text-gray-400 font-mono text-xs uppercase tracking-[0.2em]">Strategic Node</span>
                </div>

                <h3 className="text-4xl font-black mb-4 text-white tracking-tight">Krishna Xerox</h3>

                <p className="text-gray-400 text-lg leading-relaxed mb-8 pl-4 border-l-2 border-[#80ED99]">
                    Equipped with high-speed industrial laser machines.
                    <br />
                    <span className="text-white font-bold block mt-2 text-2xl">
                        60 Pages / Minute.
                    </span>
                </p>

                {/* Features Pills */}
                <div className="flex flex-wrap gap-3 mb-10">
                    <div className="text-xs font-bold text-gray-400 bg-[#1a1a1a] px-3 py-2 rounded-lg border border-gray-800 flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-[#80ED99]" /> Near Station
                    </div>
                    <div className="text-xs font-bold text-gray-400 bg-[#1a1a1a] px-3 py-2 rounded-lg border border-gray-800 flex items-center gap-2">
                        <Zap className="w-3 h-3 text-[#80ED99]" /> Instant Print
                    </div>
                </div>

                <a
                    href="https://www.google.com/maps/dir//Shop+No+9,+Krishna+Xerox,+Hanuman+mandir,+Bhayandar,+Navghar+Naka,+Bhayandar+East,+Mira+Bhayandar,+Maharashtra+401105/@19.3075199,72.860526,17z/data=!4m17!1m7!3m6!1s0x3be7b02f56c2c51f:0x11965aed30000000!2sKrishna+Xerox!8m2!3d19.3075199!4d72.8631009!16s%2Fg%2F11p6snchcn!4m8!1m0!1m5!1m1!1s0x3be7b02f56c2c51f:0x11965aed30000000!2m2!1d72.8630921!2d19.3075291!3e3?entry=ttu&g_ep=EgoyMDI2MDExMy4wIKXMDSoASAFQAw%3D%3D"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white text-black px-6 py-4 rounded-xl font-bold hover:bg-[#80ED99] transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer w-full"
                >
                    Get Directions <ArrowRight className="w-5 h-5" />
                </a>
            </div>

        </div>
    </div>
</div>

            <Footer />

        </div >
    );
};

export default AboutPage;


