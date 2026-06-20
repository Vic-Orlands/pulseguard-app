#!/bin/bash

# Terminal width detection
TERM_WIDTH=$(tput cols)

# Function to center text
center_text() {
    local text="$1"
    local width="$2"
    local padding=$(( (width - ${#text}) / 2 ))
    printf "%${padding}s%s%${padding}s\n" "" "$text" ""
}

# Function to create full-width line with character
make_line() {
    local char="$1"
    printf "%${TERM_WIDTH}s\n" | tr " " "$char"
}

# Gradient colors
C_BLUE="\033[38;5;39m"
C_DARK_BLUE="\033[34m"
C_CYAN="\033[38;5;45m"
C_PURPLE="\033[38;5;141m"
C_RESET="\033[0m"
C_BOLD="\033[1m"
C_DIM="\033[2m"

# Draw the header
echo -e "${C_DARK_BLUE}$(make_line "═")${C_RESET}"

# Logo (centered)
echo -e "${C_BOLD}${C_CYAN}"
center_text "██████╗ ██╗   ██╗██╗     ███████╗███████╗ ██████╗ ██╗   ██╗ █████╗ ██████╗ ██████╗ " $TERM_WIDTH
center_text "██╔══██╗██║   ██║██║     ██╔════╝██╔════╝██╔════╝ ██║   ██║██╔══██╗██╔══██╗██╔══██╗" $TERM_WIDTH
center_text "██████╔╝██║   ██║██║     ███████╗█████╗  ██║  ███╗██║   ██║███████║██████╔╝██║  ██║" $TERM_WIDTH
center_text "██╔═══╝ ██║   ██║██║     ╚════██║██╔══╝  ██║   ██║██║   ██║██╔══██║██╔══██╗██║  ██║" $TERM_WIDTH
center_text "██║     ╚██████╔╝███████╗███████║███████╗╚██████╔╝╚██████╔╝██║  ██║██║  ██║██████╔╝" $TERM_WIDTH
center_text "╚═╝      ╚═════╝ ╚══════╝╚══════╝╚══════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ " $TERM_WIDTH
# echo -e "${C_RESET}"

# Tagline
echo -e "${C_PURPLE}${C_BOLD}"
center_text "🖥️ Enterprise-Grade Observability Platform" $TERM_WIDTH
echo -e "${C_RESET}"

# Draw middle separator
echo -e "${C_DARK_BLUE}$(make_line "─")${C_RESET}"

# Description block
echo -e "${C_CYAN}"
center_text "Comprehensive real-time monitoring, logging, and analytics for modern applications" $TERM_WIDTH
echo ""
center_text "• Distributed tracing • Anomaly detection • Metrics visualization • Alert management •" $TERM_WIDTH
center_text "• Infrastructure monitoring • Custom dashboards • API integrations • Low overhead •" $TERM_WIDTH
echo -e "${C_RESET}"

# Draw the footer
echo -e "${C_DARK_BLUE}$(make_line "═")${C_RESET}"

# System info and startup message
echo ""
echo -e "${C_DIM}System: $(uname -s) $(uname -r) | Starting services: $(date)${C_RESET}"
echo ""

# Run docker-compose with spinner
echo -e "${C_BOLD}PulseGuard environment is ready!${C_RESET}"
