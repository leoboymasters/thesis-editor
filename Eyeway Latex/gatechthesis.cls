
% gatechthesis class - for use in preparation of Theses and Dissertations at Georgia Tech
% revised May 2020

\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{gatechthesis}[2020/05/07 GA Tech MS/PhD Thesis Class]

% based on report class, so pass options to it
\DeclareOption*{\PassOptionsToClass{\CurrentOption}{report}}
\ProcessOptions\relax
\LoadClass{report}

% package imports - add your own in preamble to the document file with \usepackage{}
\RequirePackage{graphicx}  % for images and plots
\RequirePackage[a4paper, left=1.5in, right=1in, top=1in, bottom=1in]{geometry}
\RequirePackage{multicol} % for multicolumn environments
\RequirePackage{setspace}  % use this package to set linespacing as desired
\RequirePackage{times} % use times new roman font
\RequirePackage[explicit]{titlesec}  % title control and formatting
\RequirePackage[titles]{tocloft}  % table of contents control and formatting
\RequirePackage{ifoddpage} % logical page parity checking, used with rotating
\RequirePackage{rotating}  % for rotated, landscape images
\RequirePackage[backend=biber,sorting=nyt, style=apa]{biblatex}  % reference manager %bibstyle=ieee
\RequirePackage[toc,page]{appendix}  % for appendices
\RequirePackage[normalem]{ulem}  % for underlining text
\RequirePackage{url} % in case explicit URL's are needed
\RequirePackage{siunitx} % several functions related to expressing units
\RequirePackage[bookmarks=true,hidelinks]{hyperref} % should be last(ish)
\RequirePackage{bookmark} % allows reformatting of pdf bookmarks
\RequirePackage{caption} % captions for figures
\RequirePackage{subcaption} % allows subfigures in a reasonable way, plays nice with caption
\RequirePackage[acronym,nogroupskip,nopostdot]{glossaries} % only for list of acronyms
\RequirePackage{doi} % and this is laster, makes easier hyperlinking for doi sources

\sisetup{
    sticky-per=true,
    detect-mode=true,
    per-mode = symbol-or-fraction
}

\onehalfspacing  % set line spacing
\AtBeginDocument{\renewcommand{\ref}[1]{\autoref{#1}}} % for concision, but can be removed if you know what you're doing
\makeglossaries % process glossaries
\urlstyle{same} % uses the text font, not a monospace one, for URLs
\hbadness=9000 % suppress some hbox warnings
\setcounter{biburlnumpenalty}{99999} % ensure bibliography URLs don't run far outside margins)

% hyperlink coloring, or lack thereof
\hypersetup{
    colorlinks,
    linkcolor={black},
    citecolor={black}, 
    urlcolor={black}
}

\makeatletter

% formatting of chapter numbers in bookmarks
\bookmarksetup{%
    depth=1, % bookmark depth - 1 goes to section depth, 2 to subsection, etc.
    addtohook={%
    \ifnum 0=\bookmarkget{level}\relax
      \renewcommand*{\numberline}[1]{#1 | }%
    \fi
    \ifnum 0<\bookmarkget{level}\relax
      \renewcommand*{\numberline}[1]{}%
    \fi
    }
}

% so that using ref with algorithms works correctly
\newcommand{\ALC@uniqueautorefname}{Line}
\newcommand{\algorithmautorefname}{Algorithm}

% set up rotatepage environment - this will make landscape figures with awareness of page parity and whether the document is set up as single- or two-sided
\@ifclasswith{report}{twoside}{%
    \newenvironment{rotatepage}{%
        \checkoddpage\ifoddpage
            \clearpage\pagebreak[4]\global\pdfpageattr\expandafter{\the\pdfpageattr/Rotate 270}%
        \else
            \clearpage\pagebreak[4]\global\pdfpageattr\expandafter{\the\pdfpageattr/Rotate 90}%
        \fi
        }%
        {\clearpage\pagebreak[4]\global\pdfpageattr\expandafter{\the\pdfpageattr/Rotate 0}}%
    }{
    \newenvironment{rotatepage}%
        {\clearpage\pagebreak[4]\global\pdfpageattr\expandafter{\the\pdfpageattr/Rotate 90}}%
        {\clearpage\pagebreak[4]\global\pdfpageattr\expandafter{\the\pdfpageattr/Rotate 0}}%
    }

% tokens for author info
\newcommand{\approvaldate}[1]{\gdef\@approvaldate{#1}}%
\newcommand{\@approvaldate}{\@latex@warning@no@line{No \noexpand\approvaldate given}}
\newcommand{\school}[1]{\gdef\@school{#1}}%
\newcommand{\@school}{\@latex@warning@no@line{No \noexpand\school given}}
\newcommand{\department}[1]{\gdef\@department{#1}}%
\newcommand{\@department}{\@latex@warning@no@line{No \noexpand\department given}}
\makeatother

% frontmatter environment, only handles title formatting
\newenvironment{frontmatter}{%
    \clearpage
    \pagestyle{plain}
    \titleformat{\chapter}[display]{\normalfont\bfseries\filcenter}{\chaptertitlename\ \thechapter}{0pt}{\MakeUppercase{##1}}
    \setlength{\parindent}{0.5in} % Add indentation to paragraphs
}%
{%
    \clearpage
}

% thesisbody environment, handles text and other formatting 
\newenvironment{thesisbody}{%
    \clearpage
    \pagestyle{plain}
    \pagenumbering{arabic} % resumes page numbering after front matter
    \setcounter{page}{1} % set the page number appropriately
    \titleformat{\chapter}[display]{\normalfont\bfseries\filcenter}{\MakeUppercase\chaptertitlename\ \thechapter}{0pt}{\MakeUppercase{##1}}  % spacing between titles
    \titlespacing*{\chapter}
      {0pt}{0pt}{30pt}	% controls vertical margins on title
    \titleformat{\section}{\normalfont\bfseries}{\thesection}{1em}{##1}
    \titleformat{\subsection}{\normalfont\bfseries}{\thesubsection}{1em}{##1}
    \titleformat{\subsubsection}{\normalfont\itshape}{\thesubsection}{1em}{##1}
    \setlength{\parindent}{0.5in} % Add indentation to paragraphs
}%
{
    \clearpage
}

% ------------------ Title Page ------------------
\makeatletter
% args: {month}{year}
\newcommand{\makeTitlePage}[2]{
    \pagestyle{empty}
    \pagenumbering{roman}
    \currentpdfbookmark{Title Page}{titlePage}
    \phantomsection
    \begin{center}
    \begin{singlespacing}
    \includegraphics[width=1.5in]{msuiit_logo.png}\\
    \vspace{\baselineskip}
    \textbf{MINDANAO STATE UNIVERSITY - ILIGAN INSTITUTE OF TECHNOLOGY}\\
    \vspace{\baselineskip}
    \textbf{Master of Science in Computer Applications}\\
    \vspace{2\baselineskip}
    \textbf{\@author}
    
    \vspace{3\baselineskip}
    \textbf{\@title}\\
    \vspace{3\baselineskip}
    Thesis Adviser:\\
    \vspace{0.5\baselineskip}
    \textbf{Orven Llantos, Ph.D.}\\
    \vspace{0.5\baselineskip}
    \textbf{}\\

    \vspace{\baselineskip}
    Presented to the\\
    \vspace{.1\baselineskip}
    Department of Computer Applications\\
    \vspace{.1\baselineskip}
    College of Computer Studies\\
    \vspace{.1\baselineskip}
    MSU – Iligan Institute of Technology\\
    \vspace{.1\baselineskip}
    Iligan City\\

    \vspace{9\baselineskip}
    Date of Submission\\
    \vspace{0.5\baselineskip}
    #1 #2 \\

    \vspace{3\baselineskip}
    This thesis is not available to the public. Please ask the library for assistance.
    
    \vfill
    
    \end{singlespacing}
    \end{center}
}

% ------------------ Approval page environment/formatting ------------------

\newenvironment{approvalPage}
{
    \clearpage
    %\phantomsection
    %\addcontentsline{toc}{chapter}{Thesis Approval}
    \begin{centering}
    \textbf{THESIS APPROVAL}\\
    \vspace{\baselineskip}
    \end{centering}
}
{
    \clearpage
}

% ------------------ Endorsement environment/formatting ------------------
\newenvironment{panel_approval}
{
    \clearpage
    %\phantomsection
    %\addcontentsline{toc}{chapter}{Endorsement}
    \begin{centering}
    %\textbf{THE ORIGINAL DECLARATION OF THESIS}\\
    %\vspace{\baselineskip}
        \begin{singlespacing}
        Mindanao State University\\
        ILIGAN INSTITUTE OF TECHNOLOGY\\
        College of Studies\\
        Iligan City, 9200 Philippines\\
        \end{singlespacing}
        \vspace{\baselineskip}
    \end{centering}
    \begin{centering}
        \textbf{CERTIFICATION OF PANEL APPROVAL}\\
        \vspace{\baselineskip}
    \end{centering}
}
{
    \clearpage
}
% ------------------ Dedication ------------------
\newcommand{\makeDedication}[1]
{
    \clearpage
    %\phantomsection
    %\addcontentsline{toc}{chapter}{Dedication}
   \begin{centering}
    \textbf{DEDICATION}\\
    \vspace{\baselineskip}
    \end{centering}
\begin{center}
\vspace*{\fill}
#1\\
\vspace*{\fill}
\end{center}
}

% ------------------ Acknowledgments environment/formatting ------------------
\newenvironment{acknowledgments}
{
    \clearpage
    \phantomsection
    \addcontentsline{toc}{chapter}{Acknowledgments}
    \begin{centering}
    \textbf{ACKNOWLEDGMENTS}\\
    \vspace{\baselineskip}
    \end{centering}
}
{
    \clearpage
}

% --------------- table of contents formatting and command creation ---------------
\renewcommand{\cftchapdotsep}{\cftdotsep}  % add dot separators
\renewcommand{\cftchapfont}{\bfseries}  % set title font weight
\renewcommand{\cftchappagefont}{}  % set page number font weight
\renewcommand{\cftchappresnum}{Chapter }
\renewcommand{\cftchapaftersnum}{:}
\renewcommand{\cftchapnumwidth}{5em}
\renewcommand{\cftchapafterpnum}{\vskip\baselineskip} % set correct spacing for entries in single space environment
\renewcommand{\cftsecafterpnum}{\vskip\baselineskip}  % set correct spacing for entries in single space environment
\renewcommand{\cftsubsecafterpnum}{\vskip\baselineskip} % set correct spacing for entries in single space environment
\renewcommand{\cftsubsubsecafterpnum}{\vskip\baselineskip} % set correct spacing for entries in single space environment
\newcommand{\makeTOC}{
    % format title font size and position (this also applies to list of figures and list of tables)
    \currentpdfbookmark{Table of Contents}{TOC}
    \renewcommand\contentsname{Table of Contents}
    \begin{singlespace}
    \tableofcontents
    \end{singlespace}
    \clearpage
}

% ------------------ List of Tables ------------------
\newcommand{\makeListOfTables}{
\phantomsection
\addcontentsline{toc}{chapter}{List of Tables}
\begin{singlespace}
\setlength\cftbeforetabskip{\baselineskip}  % manually set spacing between entries
\listoftables
\end{singlespace}
\clearpage
}

% ------------------ List of Figures ------------------
\newcommand{\makeListOfFigures}{
\phantomsection
\addcontentsline{toc}{chapter}{List of Figures}
\begin{singlespace}
\setlength\cftbeforefigskip{\baselineskip}  % manually set spacing between entries
\listoffigures
\end{singlespace}
\clearpage
}

% ------------------ List of Acronyms ------------------
\newcommand{\makeListOfAcronyms}{
\phantomsection
\singlespacing
\addcontentsline{toc}{chapter}{List of Acronyms}
\printacronyms[nonumberlist,title={List of Acronyms}]
\clearpage
\doublespacing
}

% ------------------ summary environment definition ------------------
\newenvironment{summary}{
    \clearpage
    \addcontentsline{toc}{chapter}{Abstract}
    \begin{centering}
    \textbf{ABSTRACT}\\
    \vspace{\baselineskip}
    \end{centering}
}{
}

% ------------------ appendix environment definition ------------------
% A note on layout: in the Chicago (and by extension IEEE) style manual, appendices are first in the end matter, then bibliography or references. In APA, bibliography is first, then appendices. The thesis manual on which this template is based assumes the Chicago convention.

% remove the page number on the appendices cover and move bookmark up the page, create a group-subgroup structure for the appendices in the TOC/bookmarks
\makeatletter
\newenvironment{theappendices}{
    \bookmarksetup{depth=0,open}
    \addtocontents{toc}{\setcounter{tocdepth}{1}}
    \renewcommand{\@chap@pppage}{%
        \clear@ppage
        \addappheadtotoc
        \thispagestyle{empty}%
        \if@twocolumn\onecolumn\@tempswatrue\else\@tempswafalse\fi
        \null\vfil
        \markboth{}{}%
        {\centering
        \interlinepenalty \@M
        \normalfont
        \Huge \bfseries \appendixpagename\par}%
        \if@dotoc@pp
        \fi
    }
    \bookmarksetupnext{level=part}
    \begin{appendices}
    \addtocontents{toc}{\protect\renewcommand{\protect\cftsecpresnum}{\appendixname\space}}
    \addtocontents{toc}{\protect\renewcommand{\protect\cftsecnumwidth}{5.75em}}
    \addtocontents{toc}{\protect\renewcommand{\protect\cftsecaftersnum}{:}}
    \addtocontents{toc}{%
    \begingroup
        \let\protect\l@chapter\protect\l@section
        \let\protect\l@section\protect\l@subsection
    }
}{
    \addtocontents{toc}{\endgroup}
    \end{appendices}
}
\makeatother

% ------------------ bibliography formatting and command creation ------------------

% I am only leaving these \AtEveryBibitem lines in because they were in the original template when I downloaded it. Change these at your own leisure.

% prevent certain fields in references from printing in bibliography
\AtEveryBibitem{\clearfield{issn}}
\AtEveryBibitem{\clearlist{issn}}
\AtEveryBibitem{\clearfield{language}}
\AtEveryBibitem{\clearlist{language}}
\AtEveryBibitem{\clearfield{doi}}
\AtEveryBibitem{\clearlist{doi}}
\AtEveryBibitem{\clearfield{url}}
\AtEveryBibitem{\clearlist{url}}
\AtEveryBibitem{%
\ifentrytype{online}{}
    {\clearfield{urlyear}\clearfield{urlmonth}\clearfield{urlday}}}

\newcommand{\makeBibliography}{
    \clearpage
    \bookmarksetupnext{level=part}
    \phantomsection
    \addcontentsline{toc}{chapter}{References}
    \begin{centering}
    \textbf{REFERENCES}\\
    \end{centering}
    \begin{singlespace}  % use single-line spacing for multi-line text within a single reference
    \setlength\bibitemsep{\baselineskip}  % manually set separation between items in bibliography to double space
    \printbibliography[heading=none]
    \end{singlespace}
}

% ------------------ Table Formatting ------------------
\RequirePackage{booktabs}  % For professional table formatting
\RequirePackage{array}     % For advanced table column formatting
\RequirePackage{tabularx} % For full-width tables

% Set table spacing
\setlength{\abovecaptionskip}{10pt}
\setlength{\belowcaptionskip}{6pt}
\renewcommand{\arraystretch}{1.2}  % Adjust row height
\setlength{\tabcolsep}{10pt}       % Adjust column spacing

% Table rule settings
\setlength{\heavyrulewidth}{0.5pt}    % Top and bottom rules
\setlength{\lightrulewidth}{0.5pt}    % Mid rules
\setlength{\arrayrulewidth}{0.5pt}    % Standard rules

% Define column types for better text alignment
\newcolumntype{L}{>{\raggedright\arraybackslash}X}

\usepackage{tikz}
\usepackage{pgfplots}
\usepackage{enumitem}
\usetikzlibrary{arrows.meta, shadows, fit, backgrounds, positioning, calc}

% In the gatechthesis.cls file, update the hyperref settings:

% Find the existing hypersetup block and modify it to:
\hypersetup{
    colorlinks=true,
    linkcolor=black,    % for TOC and internal links
    citecolor=black,    % for citation links
    urlcolor=black,     % for URL links
    bookmarks=true,
    bookmarksopen=true,
    bookmarksnumbered=true,
    pdfstartview=FitH,
    pdfborder={0 0 0}
}

% Then add these lines after the hypersetup:
\RequirePackage{xcolor}
\definecolor{citationcolor}{RGB}{0,0,238}  % Standard hyperlink blue

% Note: biblatex is already loaded at the top of this file (line 23)
% Do not load it again here to avoid "Option clash" errors

% Example usage:
%
% \begin{table}[htbp]
%   \caption{Current Manual Assessment Costs}
%   \begin{tabularx}{\textwidth}{L l}
%     \hline
%     Parameter & Value \\ 
%     \hline
%     Daily Labor Cost & Php 1,700 \\
%     Number of Surveyors & 10 \\
%     Survey Duration & 90 days \\
%     Survey Length & 250 km \\
%     Total Cost per km & Php 6,120 \\
%     \hline
%   \end{tabularx}
% \end{table}