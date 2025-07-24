// VC Calculator Logic
class VCCalculator {
    constructor() {
        this.roundTypes = [
            'Pre-seed', 'Seed', 'Seed+', 'Series A', 'Series A+', 'Series B', 'Series B+', 'Series C', 'Series C+', 'Series D', 'Series D+', 'Series E', 'Series E+'
        ];
        
        // Default values for each stage
        this.stageDefaults = {
            'Pre-seed': { roundSize: 650000, valuation: 7000000, investment: 500000 },
            'Seed': { roundSize: 3325000, valuation: 13300000, investment: 1000000 },
            'Seed+': { roundSize: 3325000, valuation: 13300000, investment: 1000000 },
            'Series A': { roundSize: 10000000, valuation: 40000000, investment: 2000000 },
            'Series A+': { roundSize: 10000000, valuation: 40000000, investment: 2000000 },
            'Series B': { roundSize: 18000000, valuation: 90000000, investment: 3000000 },
            'Series B+': { roundSize: 18000000, valuation: 90000000, investment: 3000000 },
            'Series C': { roundSize: 23000000, valuation: 158000000, investment: 4000000 },
            'Series C+': { roundSize: 23000000, valuation: 158000000, investment: 4000000 },
            'Series D': { roundSize: 33000000, valuation: 376000000, investment: 5000000 },
            'Series D+': { roundSize: 33000000, valuation: 376000000, investment: 5000000 },
            'Series E': { roundSize: 37000000, valuation: 420000000, investment: 6000000 },
            'Series E+': { roundSize: 37000000, valuation: 420000000, investment: 7000000 }
        };
        
        this.rounds = [this.createDefaultRound()];
        this.roundIdCounter = 1;
        this.roundNodes = new Map();
        this.exitData = null; // Separate exit modeling
        this.initializeElements();
        this.bindEvents();
        this.setupDefaultValues();
        this.renderRounds();
    }

    createDefaultRound(baseType) {
        let nextType = 'Seed';
        if (baseType) {
            const idx = this.roundTypes.indexOf(baseType);
            if (idx >= 0 && idx < this.roundTypes.length - 1) {
                nextType = this.roundTypes[idx + 1];
            } else if (idx >= 0) {
                nextType = this.roundTypes[idx];
            }
        }
        
        // Get defaults for the selected type
        const defaults = this.stageDefaults[nextType];
        const preMoney = defaults ? defaults.valuation.toLocaleString() : '';
        const roundSize = defaults ? defaults.roundSize.toLocaleString() : '';
        
        return {
            id: this.roundIdCounter++,
            type: nextType,
            preMoney: preMoney,
            roundSize: roundSize,
            followOn: '',
            proRata: false,
            ownership: ''
        };
    }

    initializeElements() {
        // Input elements
        this.investmentInput = document.getElementById('investment');
        this.preMoneyInput = document.getElementById('preMoney');
        this.roundSizeInput = document.getElementById('roundSize');
        this.fundSizeInput = document.getElementById('fundSize');
        this.dilutionInput = document.getElementById('dilution');
        this.dilutionValue = document.getElementById('dilutionValue');
        this.manualDilutionInput = document.getElementById('manualDilution');
        this.manualDilutionValue = document.getElementById('manualDilutionValue');
        this.roundsList = document.getElementById('rounds-list');
        this.addRoundBtn = document.getElementById('add-round-btn');
        this.addExitBtn = document.getElementById('add-exit-btn');
        this.showRoundsBtn = document.getElementById('show-rounds-btn');
        this.roundsSection = document.querySelector('.rounds-section');
        this.exitSection = document.querySelector('.exit-section');
        this.dilutionGroup = document.getElementById('dilution-group');
        this.container = document.querySelector('.container');
        this.initialRoundSelect = document.getElementById('initialRound');

        // Exit elements
        this.exitValuationInput = document.getElementById('exitValuation');
        this.exitFinalOwnershipInput = document.getElementById('exitFinalOwnership');
        this.exitProceedsInput = document.getElementById('exitProceeds');
        this.exitMultipleInput = document.getElementById('exitMultiple');
        this.removeExitBtn = document.getElementById('remove-exit-btn');

        // Output elements
        this.initialOwnershipOutput = document.getElementById('initialOwnership');
        this.dilutedOwnershipOutput = document.getElementById('dilutedOwnership');
        this.returnTheFundValuationOutput = document.getElementById('returnTheFundValuation');
        this.returnOneThirdFundValuationOutput = document.getElementById("returnOneThirdFundValuation");
        this.returnTwoThirdsFundValuationOutput = document.getElementById("returnTwoThirdsFundValuation");        this.totalInvestmentOutput = document.getElementById('totalInvestment');
        this.totalInvestmentCard = document.getElementById('totalInvestmentCard');

        // Export elements
        this.exportExcelBtn = document.getElementById('export-excel-btn');
        this.exportModal = document.getElementById('exportModal');
        this.companyNameInput = document.getElementById('companyNameInput');
        this.exportConfirmBtn = document.getElementById('exportConfirmBtn');
        this.exportCancelBtn = document.getElementById('exportCancelBtn');
    }

    bindEvents() {
        // Bind input events for real-time updates and formatting
        const textInputs = [
            this.investmentInput,
            this.preMoneyInput,
            this.roundSizeInput,
            this.fundSizeInput
        ];

        textInputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.value = input.value.replace(/,/g, '');
            });
            input.addEventListener('blur', () => {
                const value = input.value.replace(/,/g, '');
                const numValue = parseFloat(value);
                if (!isNaN(numValue) && value !== '') {
                    input.value = numValue.toLocaleString();
                }
            });
            input.addEventListener('input', () => this.calculate());
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    // Format and blur on Enter
                    const value = input.value.replace(/,/g, '');
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue) && value !== '') {
                        input.value = numValue.toLocaleString();
                    }
                    input.blur();
                }
            });
        });

        // Dilution slider and input
        this.dilutionInput.addEventListener('input', (e) => {
            this.dilutionValue.value = e.target.value;
            this.calculate();
        });
        
        // Dilution input field
        this.dilutionValue.addEventListener('input', (e) => {
            const value = parseInt(e.target.value) || 0;
            const clampedValue = Math.max(0, Math.min(99, value));
            this.dilutionInput.value = clampedValue;
            this.dilutionValue.value = clampedValue;
            this.calculate();
        });
        
        this.dilutionValue.addEventListener('blur', (e) => {
            const value = parseInt(e.target.value) || 0;
            const clampedValue = Math.max(0, Math.min(99, value));
            this.dilutionInput.value = clampedValue;
            this.dilutionValue.value = clampedValue;
            this.calculate();
        });
        
        // Manual dilution slider and input
        if (this.manualDilutionInput) {
            this.manualDilutionInput.addEventListener('input', (e) => {
                this.manualDilutionValue.value = e.target.value;
                this.calculate();
                if (this.exitData) {
                    this.calculateExitValues();
                }
            });
        }
        
        if (this.manualDilutionValue) {
            this.manualDilutionValue.addEventListener('input', (e) => {
                const value = parseInt(e.target.value) || 0;
                const clampedValue = Math.max(0, Math.min(99, value));
                this.manualDilutionInput.value = clampedValue;
                this.manualDilutionValue.value = clampedValue;
                this.calculate();
                if (this.exitData) {
                    this.calculateExitValues();
                }
            });
            
            this.manualDilutionValue.addEventListener('blur', (e) => {
                const value = parseInt(e.target.value) || 0;
                const clampedValue = Math.max(0, Math.min(99, value));
                this.manualDilutionInput.value = clampedValue;
                this.manualDilutionValue.value = clampedValue;
                this.calculate();
                if (this.exitData) {
                    this.calculateExitValues();
                }
            });
        }

        if (this.addRoundBtn) {
            this.addRoundBtn.addEventListener('click', () => {
                let baseType;
                if (this.rounds.length === 0 && this.initialRoundSelect) {
                    baseType = this.initialRoundSelect.value;
                } else if (this.rounds.length > 0) {
                    baseType = this.rounds[this.rounds.length - 1].type;
                }
                const newRound = this.createDefaultRound(baseType);
                
                // Calculate ownership based on initial ownership and dilution
                const defaults = this.stageDefaults[newRound.type];
                if (defaults) {
                    const initialInvestment = parseFloat(this.investmentInput.value.replace(/,/g, '')) || 0;
                    const initialPreMoney = parseFloat(this.preMoneyInput.value.replace(/,/g, '')) || 0;
                    const initialRoundSize = parseFloat(this.roundSizeInput.value.replace(/,/g, '')) || 0;
                    const initialPostMoney = initialPreMoney + initialRoundSize;
                    
                    if (initialPostMoney > 0 && initialInvestment > 0) {
                        const initialOwnership = initialInvestment / initialPostMoney;
                        const dilution = parseFloat(this.dilutionInput.value) || 0;
                        const dilutedOwnership = initialOwnership * (1 - dilution / 100);
                        newRound.ownership = (dilutedOwnership * 100).toFixed(2);
                    }
                }
                
                this.rounds.push(newRound);
                this.renderRounds();
            });
        }

        if (this.addExitBtn) {
            this.addExitBtn.addEventListener('click', () => {
                this.exitData = {
                    exitValuation: '1000000000',
                    proceeds: '',
                    multiple: ''
                };
                this.exitSection.style.display = '';
                this.exitValuationInput.value = '1,000,000,000';
                this.calculateExitValues();
            });
        }

        if (this.removeExitBtn) {
            this.removeExitBtn.addEventListener('click', () => {
                this.exitData = null;
                this.exitSection.style.display = 'none';
                this.exitValuationInput.value = '';
                this.exitProceedsInput.value = '';
                this.exitMultipleInput.value = '';
            });
        }

        if (this.exitValuationInput) {
            this.addCommaFormatting(this.exitValuationInput, (formattedValue) => {
                if (this.exitData) {
                    this.exitData.exitValuation = formattedValue;
                    this.calculateExitValues();
                }
            });
            this.exitValuationInput.addEventListener('input', () => {
                if (this.exitData) {
                    this.exitData.exitValuation = this.exitValuationInput.value;
                    this.calculateExitValues();
                }
            });
        }

        // Model Specific Details button (always attach, no conditions, no node replacement)
        if (this.showRoundsBtn && this.roundsSection && this.roundsSection.style.display !== 'none' && this.rounds.length > 0) {
            this.showRoundsBtn.addEventListener('click', () => {
                this.roundsSection.style.display = '';
                this.container.classList.add('hide-dilution');
                this.dilutionGroup.style.display = 'none';
                this.showRoundsBtn.style.display = 'none';
                // Show manual dilution group below rounds
                const manualDilutionGroup = document.getElementById('manual-dilution-group');
                if (manualDilutionGroup) {
                    manualDilutionGroup.style.display = '';
                }
                // Optionally, trigger recalculation
                this.calculate();
            });
        }

        // Post-money and initial ownership calculation
        const updatePostMoneyAndOwnership = () => {
            const pre = parseFloat(this.preMoneyInput.value.replace(/,/g, '')) || 0;
            const round = parseFloat(this.roundSizeInput.value.replace(/,/g, '')) || 0;
            const investment = parseFloat(this.investmentInput.value.replace(/,/g, '')) || 0;
            const post = pre + round;
            const postMoneyInput = document.getElementById('postMoney');
            if (postMoneyInput) {
                postMoneyInput.value = post > 0 ? post.toLocaleString() : '';
            }
            
            // Calculate initial ownership
            if (this.initialOwnershipOutput) {
                const initialOwnership = post > 0 && investment > 0 ? (investment / post) * 100 : 0;
                this.initialOwnershipOutput.value = initialOwnership > 0 ? initialOwnership.toFixed(2) : '';
            }
            
            // Also trigger main calculation to update final results
            this.calculate();
            
            // Update round ownerships if rounds are being used
            if (this.rounds.length > 0) {
                this.updateRoundOwnerships();
            }
            
            // Update exit calculations if exit is being modeled
            if (this.exitData) {
                this.calculateExitValues();
            }
        };
        if (this.preMoneyInput) this.preMoneyInput.addEventListener('input', updatePostMoneyAndOwnership);
        if (this.roundSizeInput) this.roundSizeInput.addEventListener('input', updatePostMoneyAndOwnership);
        if (this.investmentInput) this.investmentInput.addEventListener('input', updatePostMoneyAndOwnership);
        // Also update on initial load
        updatePostMoneyAndOwnership();
        
        // Initial round select change handler
        if (this.initialRoundSelect) {
            this.initialRoundSelect.addEventListener('change', (e) => {
                this.updateStageDefaults(e.target.value);
                // Ensure all calculations and UI are updated
                if (this.rounds.length > 0) {
                    this.updateRoundOwnerships();
                }
                if (this.exitData) {
                    this.calculateExitValues();
                }
            });
        }

        // Pro rata checkbox
        const proRataInputs = this.roundsList.querySelectorAll('.round-proRata');
        proRataInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const idx = +e.target.dataset.idx;
                this.rounds[idx].proRata = e.target.checked;
                if (e.target.checked) {
                    // Calculate pro rata follow-on investment
                    let prevOwnership = null;
                    if (idx === 0) {
                        // Use initial ownership from initial investment
                        const initialInvestment = parseFloat(this.investmentInput.value.replace(/,/g, '')) || 0;
                        const initialPreMoney = parseFloat(this.preMoneyInput.value.replace(/,/g, '')) || 0;
                        const initialRoundSize = parseFloat(this.roundSizeInput.value.replace(/,/g, '')) || 0;
                        const initialPostMoney = initialPreMoney + initialRoundSize;
                        prevOwnership = initialPostMoney > 0 && initialInvestment > 0 ? (initialInvestment / initialPostMoney) : 0;
                    } else {
                        prevOwnership = (parseFloat(this.rounds[idx - 1].ownership) || 0) / 100;
                    }
                    const preMoney = parseFloat((this.rounds[idx].preMoney || '').replace(/,/g, '')) || 0;
                    const roundSize = parseFloat((this.rounds[idx].roundSize || '').replace(/,/g, '')) || 0;
                    const postMoney = preMoney + roundSize;
                    // Pro rata: invest enough to maintain the same ownership percentage
                    // The follow-on should be: prevOwnership * roundSize
                    const followOn = prevOwnership * roundSize;
                    this.rounds[idx].followOn = followOn > 0 ? Math.round(followOn).toLocaleString() : '';
                    const followOnInput = this.roundsList.querySelector(`.round-followOn[data-idx="${idx}"]`);
                    if (followOnInput) followOnInput.value = this.rounds[idx].followOn;
                } else {
                    this.rounds[idx].followOn = '';
                    const followOnInput = this.roundsList.querySelector(`.round-followOn[data-idx="${idx}"]`);
                    if (followOnInput) followOnInput.value = '';
                }
                // Update ownership field in place
                this.updateRoundOwnerships();
                const ownershipInput = this.roundsList.querySelector(`.round-ownership[data-idx="${idx}"]`);
                if (ownershipInput) ownershipInput.value = this.rounds[idx].ownership || '';
            });
        });

        // Export to Excel button
        if (this.exportExcelBtn) {
            this.exportExcelBtn.addEventListener('click', () => {
                this.companyNameInput.value = '';
                this.exportModal.style.display = 'flex';
                this.companyNameInput.focus();
            });
        }
        if (this.exportCancelBtn) {
            this.exportCancelBtn.addEventListener('click', () => {
                this.exportModal.style.display = 'none';
            });
        }
        if (this.exportConfirmBtn) {
            this.exportConfirmBtn.addEventListener('click', () => {
                const companyName = this.companyNameInput.value.trim() || 'Company';
                this.exportModal.style.display = 'none';
                this.exportToExcel(companyName);
            });
        }
    }

    updateStageDefaults(stage) {
        const defaults = this.stageDefaults[stage];
        if (defaults) {
            // Update the main investment fields
            this.investmentInput.value = defaults.investment.toLocaleString();
            this.preMoneyInput.value = defaults.valuation.toLocaleString();
            this.roundSizeInput.value = defaults.roundSize.toLocaleString();
            
            // Trigger calculations
            this.calculate();
            
            // Update post-money and initial ownership
            const updatePostMoneyAndOwnership = () => {
                const pre = parseFloat(this.preMoneyInput.value.replace(/,/g, '')) || 0;
                const round = parseFloat(this.roundSizeInput.value.replace(/,/g, '')) || 0;
                const investment = parseFloat(this.investmentInput.value.replace(/,/g, '')) || 0;
                const post = pre + round;
                const postMoneyInput = document.getElementById('postMoney');
                if (postMoneyInput) {
                    postMoneyInput.value = post > 0 ? post.toLocaleString() : '';
                }
                
                // Calculate initial ownership
                if (this.initialOwnershipOutput) {
                    const initialOwnership = post > 0 && investment > 0 ? (investment / post) * 100 : 0;
                    this.initialOwnershipOutput.value = initialOwnership > 0 ? initialOwnership.toFixed(2) : '';
                }
            };
            updatePostMoneyAndOwnership();
        }
    }

    setupDefaultValues() {
        // Set fund size and dilution defaults
        this.fundSizeInput.value = '65000000';
        this.dilutionInput.value = '0';
        this.dilutionValue.value = '0';

        // Set initial stage to Pre-seed and use its defaults
        if (this.initialRoundSelect) {
            this.initialRoundSelect.value = 'Pre-seed';
        }
        this.updateStageDefaults('Pre-seed');
        // Ensure calculation happens after values are set
        setTimeout(() => this.calculate(), 100);
        // Format fund size
        this.fundSizeInput.value = parseFloat(this.fundSizeInput.value).toLocaleString();

        // Trigger initial calculation
        this.calculate();
    }

    formatUSD(amount) {
        if (amount === null || amount === undefined || isNaN(amount)) {
            return '-';
        }
        
        if (amount >= 1e9) {
            return `$${(amount / 1e9).toFixed(2)}b`;
        } else if (amount >= 1e6) {
            return `$${(amount / 1e6).toFixed(2)}m`;
        } else if (amount >= 1e3) {
            return `$${(amount / 1e3).toFixed(2)}k`;
        } else {
            return `$${amount.toFixed(2)}`;
        }
    }

    formatUSDWithDecimals(amount) {
        if (amount === null || amount === undefined || isNaN(amount)) {
            return '-';
        }
        
        return `$${amount.toFixed(2)}`;
    }

    formatPercentage(value) {
        if (value === null || value === undefined || isNaN(value)) {
            return '-';
        }
        return `${value.toFixed(2)}%`;
    }

    formatMultiple(value) {
        if (value === null || value === undefined || isNaN(value)) {
            return '-';
        }
        return `${value.toFixed(1)}x`;
    }

    updateFormattedDisplay(input) {
        const value = input.value.replace(/,/g, '');
        const numValue = parseFloat(value);
        const overlay = input.parentElement.querySelector('.comma-overlay');
        if (overlay) {
            if (!isNaN(numValue) && numValue > 0) {
                overlay.textContent = numValue.toLocaleString();
                overlay.setAttribute('data-formatted', '1');
            } else {
                overlay.textContent = '';
                overlay.removeAttribute('data-formatted');
            }
        }
    }

    animateValue(element) {
        element.classList.add('updating');
        setTimeout(() => {
            element.classList.remove('updating');
        }, 300);
    }

    calculate() {
        try {
            // Get input values (remove commas for calculation)
            const investment = parseFloat(this.investmentInput.value.replace(/,/g, '')) || 0;
            const preMoney = parseFloat(this.preMoneyInput.value.replace(/,/g, '')) || 0;
            const roundSize = parseFloat(this.roundSizeInput.value.replace(/,/g, '')) || 0;
            const fundSize = parseFloat(this.fundSizeInput.value.replace(/,/g, '')) || 0;
            const dilution = parseFloat(this.dilutionInput.value) || 0;

            // Validate inputs
            if (investment <= 0 || preMoney <= 0 || roundSize <= 0 || fundSize <= 0) {
                this.clearResults();
                return;
            }

            // Calculate post-money valuation
            const postMoney = preMoney + roundSize;

            // Calculate initial ownership
            const initialOwnership = (investment / postMoney) * 100;

            // Determine final ownership based on whether rounds are being used
            let finalOwnership;
            if (this.roundsSection && this.roundsSection.style.display !== 'none' && this.rounds.length > 0) {
                // Use the last round's ownership if rounds are being modeled
                const lastRound = this.rounds[this.rounds.length - 1];
                let roundsOwnership = parseFloat(lastRound.ownership) || initialOwnership;
                
                // Apply additional manual dilution if rounds are being used
                const manualDilution = parseFloat(this.manualDilutionInput?.value || 0) || 0;
                finalOwnership = roundsOwnership * (1 - manualDilution / 100);
            } else {
                // Use slider-based dilution
                finalOwnership = initialOwnership * (1 - dilution / 100);
            }

            // Calculate exit valuation needed to return the fund
            const returnTheFundValuation = fundSize / (finalOwnership / 100);
            // Calculate exit valuations for 1/3 and 2/3 of the fund
            const returnOneThirdFundValuation = (fundSize / 3) / (finalOwnership / 100);
            const returnTwoThirdsFundValuation = (fundSize * 2 / 3) / (finalOwnership / 100);
            // Show/hide total investment field based on whether rounds are being used
            if (this.roundsSection && this.roundsSection.style.display !== 'none' && this.rounds.length > 0) {
                // Calculate total investment
                const initialInvestment = parseFloat(this.investmentInput.value.replace(/,/g, '')) || 0;
                let totalFollowOn = 0;
                this.rounds.forEach(round => {
                    const followOn = parseFloat((round.followOn || '').replace(/,/g, '')) || 0;
                    totalFollowOn += followOn;
                });
                const totalInvestment = initialInvestment + totalFollowOn;
                
                // Show total investment field
                if (this.totalInvestmentCard) {
                    this.totalInvestmentCard.style.display = '';
                }
                this.updateResult(this.totalInvestmentOutput, this.formatUSD(totalInvestment));
            } else {
                // Hide total investment field when not using rounds
                if (this.totalInvestmentCard) {
                    this.totalInvestmentCard.style.display = 'none';
                }
            }
            
            // Update results with animation
            this.updateResult(this.dilutedOwnershipOutput, this.formatPercentage(finalOwnership));
            this.updateResult(this.returnTheFundValuationOutput, this.formatUSD(returnTheFundValuation));
            this.updateResult(this.returnOneThirdFundValuationOutput, this.formatUSD(returnOneThirdFundValuation));
            this.updateResult(this.returnTwoThirdsFundValuationOutput, this.formatUSD(returnTwoThirdsFundValuation));            
            // Update exit calculations if exit is being modeled
            if (this.exitData) {
                this.calculateExitValues();
            }
        } catch (error) {
            console.error('Calculation error:', error);
            this.clearResults();
        }
    }

    updateResult(element, value) {
        if (element.textContent !== value) {
            this.animateValue(element);
            element.textContent = value;
        }
    }

    clearResults() {
        this.dilutedOwnershipOutput.textContent = '-';
        this.returnTheFundValuationOutput.textContent = '-';
        this.returnOneThirdFundValuationOutput.textContent = '-';
        this.returnTwoThirdsFundValuationOutput.textContent = '-';        if (this.totalInvestmentOutput) {
            this.totalInvestmentOutput.textContent = '-';
        }
    }

    renderRounds() {
        if (!this.roundsList) return;
        console.log('Rendering rounds:', this.rounds);
        
        // Remove deleted round nodes
        const existingIds = new Set(this.rounds.map(r => r.id));
        for (const [id, node] of this.roundNodes.entries()) {
            if (!existingIds.has(id)) {
                this.roundsList.removeChild(node);
                this.roundNodes.delete(id);
            }
        }
        
        // Add new round nodes
        this.updateRoundOwnerships();
        this.rounds.forEach((round, idx) => {
            let card = this.roundNodes.get(round.id);
            if (!card) {
                console.log('Creating new card for round:', round);
                card = this.createRoundCard(round, idx);
                this.roundNodes.set(round.id, card);
                // Insert at correct position
                const nextSibling = this.roundsList.children[idx];
                if (nextSibling) {
                    this.roundsList.insertBefore(card, nextSibling);
                } else {
                    this.roundsList.appendChild(card);
                }
            } else {
                console.log('Updating existing card for round:', round);
                // Check if the round type changed and we need to recreate the card
                if (card.dataset.roundType !== round.type) {
                    console.log('Round type changed, recreating card');
                    const nextSibling = this.roundsList.children[idx];
                    this.roundsList.removeChild(card);
                    card = this.createRoundCard(round, idx);
                    this.roundNodes.set(round.id, card);
                    if (nextSibling) {
                        this.roundsList.insertBefore(card, nextSibling);
                    } else {
                        this.roundsList.appendChild(card);
                    }
                }
            }
            // Always use the latest card reference
            card = this.roundNodes.get(round.id);
            if (card.dataset.roundType === round.type) {
                this.updateRoundCard(card, round, idx, undefined);
            }
        });
        // --- Robustly re-attach Model Specific Details button ---
        let btn = document.getElementById('show-rounds-btn');
        if (btn) {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', () => {
                this.roundsSection.style.display = '';
                this.container.classList.add('hide-dilution');
                this.dilutionGroup.style.display = 'none';
                newBtn.style.display = 'none';
                const manualDilutionGroup = document.getElementById('manual-dilution-group');
                if (manualDilutionGroup) manualDilutionGroup.style.display = '';
                this.calculate();
            });
            this.showRoundsBtn = newBtn;
        }
    }

    createRoundCard(round, idx) {
        const card = document.createElement('div');
        card.className = 'round-card';
        card.dataset.roundId = round.id;
        card.dataset.roundType = round.type;
        
        console.log('Creating regular card for round:', round);
        card.innerHTML = `
            <div>
                <label>Round</label>
                <select class="round-type">
                    ${this.roundTypes.map(type => `<option value="${type}"${round.type === type ? ' selected' : ''}>${type}</option>`).join('')}
                </select>
            </div>
            <div>
                <label>Pre-Money Valuation ($)</label>
                <input type="text" class="round-preMoney" placeholder="10,000,000">
            </div>
            <div>
                <label>Round Size ($)</label>
                <input type="text" class="round-roundSize" placeholder="5,000,000">
            </div>
            <div>
                <label>Follow-on Investment ($)</label>
                <input type="text" class="round-followOn" placeholder="1,000,000">
            </div>
            <div style="position:relative;">
                <label>Ownership (%)</label>
                <input type="text" class="round-ownership" readonly>
                <div class="ownership-tooltip"></div>
            </div>
            <div class="pro-rata-checkbox">
                <input type="checkbox" class="round-proRata">
                <span>Invest pro rata</span>
            </div>
            <button class="delete-round-btn" type="button" title="Delete round">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.5 8.5V14.5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M10 8.5V14.5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M13.5 8.5V14.5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
                    <rect x="4.5" y="4.5" width="11" height="12" rx="2" stroke="#fff" stroke-width="1.5"/>
                    <path d="M2.5 4.5H17.5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M8.5 2.5H11.5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
            </button>
        `;
        
        this.attachRoundCardEvents(card, round);
        return card;
    }

    updateRoundCard(card, round, idx, preRoundOwnerships) {
        card.querySelector('.round-type').value = round.type;
        card.querySelector('.round-preMoney').value = round.preMoney;
        card.querySelector('.round-roundSize').value = round.roundSize;
        card.querySelector('.round-followOn').value = round.followOn;
        const ownershipInput = card.querySelector('.round-ownership');
        ownershipInput.value = round.ownership || '';
        card.querySelector('.round-proRata').checked = !!round.proRata;
        // Tooltip for dilution from previous round or initial ownership, always based on actual ownership change
        const tooltip = card.querySelector('.ownership-tooltip');
        if (idx === 0) {
            // Calculate dilution from initial ownership using this.initialOwnershipPercent and raw ownership
            const initialOwnership = this.initialOwnershipPercent;
            const curr = round.rawOwnership;
            let initialDilution = null;
            if (initialOwnership && curr) {
                initialDilution = 100 - (curr / initialOwnership * 100);
            }
            if (initialDilution !== null && !isNaN(initialDilution)) {
                let displayDilution = initialDilution;
                if (Math.abs(displayDilution) < 0.05) displayDilution = 0;
                tooltip.textContent = `Dilution from initial ownership: ${displayDilution.toFixed(2)}%`;
            } else {
                tooltip.textContent = 'Dilution from initial ownership: -';
            }
        } else if (round.dilutionTooltipRaw === null || typeof round.dilutionTooltipRaw === 'undefined') {
            tooltip.textContent = 'No previous round';
        } else {
            let displayDilution = round.dilutionTooltipRaw;
            if (Math.abs(displayDilution) < 0.05) displayDilution = 0;
            tooltip.textContent = `Dilution from previous round: ${displayDilution.toFixed(2)}%`;
        }
        // Show/hide tooltip on hover
        ownershipInput.onmouseenter = () => { tooltip.classList.add('active'); };
        ownershipInput.onmouseleave = () => { tooltip.classList.remove('active'); };
        ownershipInput.onfocus = () => { tooltip.classList.add('active'); };
        ownershipInput.onblur = () => { tooltip.classList.remove('active'); };
        // Update disabled state and visual indicator for follow-on input
        const followOnInput = card.querySelector('.round-followOn');
        if (round.proRata) {
            followOnInput.disabled = true;
            followOnInput.classList.add('pro-rata-calculated');
            followOnInput.placeholder = 'Auto-calculated';
        } else {
            followOnInput.disabled = false;
            followOnInput.classList.remove('pro-rata-calculated');
            followOnInput.placeholder = '0';
        }
    }

    attachRoundCardEvents(card, round) {
        const typeInput = card.querySelector('.round-type');
        const deleteBtn = card.querySelector('.delete-round-btn');
        const preMoneyInput = card.querySelector('.round-preMoney');
        const roundSizeInput = card.querySelector('.round-roundSize');
        const followOnInput = card.querySelector('.round-followOn');
        const ownershipInput = card.querySelector('.round-ownership');
        const proRataInput = card.querySelector('.round-proRata');
        
        // Type change handler
        typeInput.addEventListener('change', (e) => {
            const newType = typeInput.value;
            console.log('Changing round type from', round.type, 'to', newType);
            
            round.type = newType;
            
            // Update round defaults based on stage
            const defaults = this.stageDefaults[newType];
            if (defaults) {
                round.preMoney = defaults.valuation.toLocaleString();
                round.roundSize = defaults.roundSize.toLocaleString();
            }
            
            // Recreate the card for the new type
            this.renderRounds();
        });
        
        // PreMoney
        this.addCommaFormatting(preMoneyInput, (formattedValue) => {
            round.preMoney = formattedValue;
            this.updateRoundOwnerships();
            ownershipInput.value = round.ownership || '';
        });
        preMoneyInput.addEventListener('input', () => {
            round.preMoney = preMoneyInput.value;
            this.updateRoundOwnerships();
            ownershipInput.value = round.ownership || '';
        });
        
        // RoundSize
        this.addCommaFormatting(roundSizeInput, (formattedValue) => {
            round.roundSize = formattedValue;
            this.updateRoundOwnerships();
            ownershipInput.value = round.ownership || '';
        });
        roundSizeInput.addEventListener('input', () => {
            round.roundSize = roundSizeInput.value;
            this.updateRoundOwnerships();
            ownershipInput.value = round.ownership || '';
        });
        
        // FollowOn
        this.addCommaFormatting(followOnInput, (formattedValue) => {
            round.followOn = formattedValue;
            round.proRata = false;
            this.updateRoundOwnerships();
            ownershipInput.value = round.ownership || '';
        });
        followOnInput.addEventListener('input', () => {
            round.followOn = followOnInput.value;
            round.proRata = false;
            this.updateRoundOwnerships();
            ownershipInput.value = round.ownership || '';
        });
        
        // Pro Rata
        proRataInput.addEventListener('change', () => {
            round.proRata = proRataInput.checked;
            if (proRataInput.checked) {
                // Calculate pro rata follow-on investment to maintain initial ownership
                const initialInvestment = parseFloat(this.investmentInput.value.replace(/,/g, '')) || 0;
                const initialPreMoney = parseFloat(this.preMoneyInput.value.replace(/,/g, '')) || 0;
                const initialRoundSize = parseFloat(this.roundSizeInput.value.replace(/,/g, '')) || 0;
                const initialPostMoney = initialPreMoney + initialRoundSize;
                const initialOwnership = initialPostMoney > 0 && initialInvestment > 0 ? (initialInvestment / initialPostMoney) : 0;
                
                const preMoney = parseFloat((round.preMoney || '').replace(/,/g, '')) || 0;
                const roundSize = parseFloat((round.roundSize || '').replace(/,/g, '')) || 0;
                const postMoney = preMoney + roundSize;
                
                // Calculate follow-on investment needed to maintain initial ownership
                const followOn = initialOwnership * postMoney;
                round.followOn = followOn > 0 ? Math.round(followOn).toLocaleString() : '';
                followOnInput.value = round.followOn;
                
                // Disable follow-on input and add visual indicator
                followOnInput.disabled = true;
                followOnInput.classList.add('pro-rata-calculated');
                followOnInput.placeholder = 'Auto-calculated';
            } else {
                round.followOn = '';
                followOnInput.value = '';
                
                // Enable follow-on input and remove visual indicator
                followOnInput.disabled = false;
                followOnInput.classList.remove('pro-rata-calculated');
                followOnInput.placeholder = '0';
            }
            this.updateRoundOwnerships();
            ownershipInput.value = round.ownership || '';
        });
        
        // Delete
        deleteBtn.addEventListener('click', () => {
            const idx = this.rounds.findIndex(r => r.id === round.id);
            this.rounds.splice(idx, 1);
            this.roundNodes.delete(round.id);
            this.roundsList.removeChild(card);
            if (this.rounds.length === 0) {
                if (this.roundsSection) this.roundsSection.style.display = 'none';
                if (this.dilutionGroup) this.dilutionGroup.style.display = '';
                if (this.showRoundsBtn) this.showRoundsBtn.style.display = '';
                if (this.container) this.container.classList.remove('hide-dilution');
                // Hide manual dilution group when no rounds
                const manualDilutionGroup = document.getElementById('manual-dilution-group');
                if (manualDilutionGroup) {
                    manualDilutionGroup.style.display = 'none';
                }
            }
            this.updateRoundOwnerships();
        });
    }

    addCommaFormatting(input, onFormat) {
        input.addEventListener('focus', () => {
            input.value = input.value.replace(/,/g, '');
        });
        input.addEventListener('blur', () => {
            const value = input.value.replace(/,/g, '');
            const numValue = parseFloat(value);
            if (!isNaN(numValue) && value !== '') {
                const formatted = numValue.toLocaleString();
                input.value = formatted;
                if (onFormat) onFormat(formatted);
            } else if (onFormat) {
                onFormat(input.value);
            }
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const value = input.value.replace(/,/g, '');
                const numValue = parseFloat(value);
                if (!isNaN(numValue) && value !== '') {
                    const formatted = numValue.toLocaleString();
                    input.value = formatted;
                    if (onFormat) onFormat(formatted);
                } else if (onFormat) {
                    onFormat(input.value);
                }
                input.blur();
            }
        });
    }

    updateRoundOwnerships() {
        // Calculate ownership for each round, compounding from initial investment
        let ownership = null;
        let postMoney = null;
        let preRoundOwnerships = [];
        // Get initial ownership
        const initialInvestment = parseFloat(this.investmentInput.value.replace(/,/g, '')) || 0;
        const initialPreMoney = parseFloat(this.preMoneyInput.value.replace(/,/g, '')) || 0;
        const initialRoundSize = parseFloat(this.roundSizeInput.value.replace(/,/g, '')) || 0;
        const initialPostMoney = initialPreMoney + initialRoundSize;
        let initialOwnership = null;
        if (initialPostMoney > 0 && initialInvestment > 0) {
            ownership = initialInvestment / initialPostMoney;
            postMoney = initialPostMoney;
            initialOwnership = ownership * 100;
        } else {
            ownership = null;
            postMoney = null;
            initialOwnership = null;
        }
        this.initialOwnershipPercent = initialOwnership; // Store on instance for tooltip
        preRoundOwnerships[0] = initialOwnership; // Always set for first round
        for (let i = 0; i < this.rounds.length; i++) {
            if (i > 0) preRoundOwnerships[i] = ownership !== null ? ownership * 100 : null; // store as percent
            const round = this.rounds[i];
            const preMoney = parseFloat((round.preMoney || '').replace(/,/g, '')) || 0;
            const roundSize = parseFloat((round.roundSize || '').replace(/,/g, '')) || 0;
            const followOn = parseFloat((round.followOn || '').replace(/,/g, '')) || 0;
            const thisPostMoney = preMoney + roundSize;
            let thisPrevOwnership = ownership; // Store ownership before this round
            if (thisPostMoney > 0 && ownership !== null) {
                if (followOn > 0) {
                    if (round.proRata) {
                        // Pro rata: keep ownership the same as before the round
                        ownership = thisPrevOwnership;
                    } else {
                        // Manual follow-on investment: apply dilution then add new ownership
                        const dilutedOwnership = ownership * (1 - roundSize / thisPostMoney);
                        const newOwnership = followOn / thisPostMoney;
                        ownership = dilutedOwnership + newOwnership;
                    }
                } else {
                    // No follow-on investment: just apply dilution from the round
                    ownership = ownership * (1 - roundSize / thisPostMoney);
                }
                round.rawOwnership = ownership * 100; // store full-precision percent
                round.ownership = (ownership * 100).toFixed(2); // display value
                // Calculate dilution for tooltip using raw values
                if (preRoundOwnerships[i] && ownership !== null) {
                    round.dilutionTooltipRaw = 100 - (round.rawOwnership / preRoundOwnerships[i] * 100);
                } else {
                    round.dilutionTooltipRaw = null;
                }
                postMoney = thisPostMoney;
            } else {
                round.ownership = '';
                round.rawOwnership = null;
                round.dilutionTooltipRaw = null;
            }
        }
        // Update the UI to show the new ownership values and dilution tooltips
        this.rounds.forEach((round, idx) => {
            const card = this.roundNodes.get(round.id);
            if (card) {
                this.updateRoundCard(card, round, idx, preRoundOwnerships);
            }
        });
        // Trigger main calculation to update final results
        this.calculate();
        // Update exit calculations if there's an Exit round
        this.calculateExitValues();
    }
    
    calculateExitValues() {
        if (!this.exitData) return;
        
        const exitValuation = parseFloat((this.exitData.exitValuation || '').replace(/,/g, '')) || 0;
        if (exitValuation <= 0) return;
        
        // Get the final ownership from the last round, or initial ownership if no rounds
        let finalOwnership = 0;
        if (this.rounds.length > 0) {
            const lastRound = this.rounds[this.rounds.length - 1];
            finalOwnership = parseFloat(lastRound.ownership) || 0;
        } else {
            // If no rounds, use initial ownership
            const initialInvestment = parseFloat(this.investmentInput.value.replace(/,/g, '')) || 0;
            const initialPreMoney = parseFloat(this.preMoneyInput.value.replace(/,/g, '')) || 0;
            const initialRoundSize = parseFloat(this.roundSizeInput.value.replace(/,/g, '')) || 0;
            const initialPostMoney = initialPreMoney + initialRoundSize;
            finalOwnership = initialPostMoney > 0 && initialInvestment > 0 ? (initialInvestment / initialPostMoney) * 100 : 0;
        }
        
        // Apply manual dilution (regardless of whether rounds are being used)
        const manualDilution = parseFloat(this.manualDilutionInput?.value || 0) || 0;
        const dilutedFinalOwnership = finalOwnership * (1 - manualDilution / 100);
        
        // Calculate proceeds
        const proceeds = (dilutedFinalOwnership / 100) * exitValuation;
        this.exitData.proceeds = proceeds > 0 ? Math.round(proceeds).toLocaleString() : '';
        
        // Calculate multiple
        const totalInvestment = this.calculateTotalInvestment();
        const multiple = totalInvestment > 0 ? proceeds / totalInvestment : 0;
        this.exitData.multiple = multiple > 0 ? multiple.toFixed(2) + 'x' : '';
        
        // Update the display
        if (this.exitFinalOwnershipInput) {
            this.exitFinalOwnershipInput.value = dilutedFinalOwnership > 0 ? dilutedFinalOwnership.toFixed(2) : '';
        }
        if (this.exitProceedsInput) {
            this.exitProceedsInput.value = this.exitData.proceeds;
        }
        if (this.exitMultipleInput) {
            this.exitMultipleInput.value = this.exitData.multiple;
        }
    }
    
    calculateTotalInvestment() {
        const initialInvestment = parseFloat(this.investmentInput.value.replace(/,/g, '')) || 0;
        let totalFollowOn = 0;
        this.rounds.forEach(round => {
            if (round.type !== 'Exit') {
                const followOn = parseFloat((round.followOn || '').replace(/,/g, '')) || 0;
                totalFollowOn += followOn;
            }
        });
        return initialInvestment + totalFollowOn;
    }

    async exportToExcel(companyName) {
        // Load SheetJS if not present
        if (typeof XLSX === 'undefined') {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
        // Gather data
        const summary = [
            ['Company Name', companyName],
            ['Fund Size', this.fundSizeInput.value],
            ['Initial Investment', this.investmentInput.value],
            ['Pre-Money Valuation', this.preMoneyInput.value],
            ['Round Size', this.roundSizeInput.value],
            ['Initial Ownership (%)', this.initialOwnershipOutput ? this.initialOwnershipOutput.value : ''],
            ['Final Ownership (%)', this.dilutedOwnershipOutput ? this.dilutedOwnershipOutput.textContent : ''],
            ['Total Investment', this.totalInvestmentOutput ? this.totalInvestmentOutput.textContent : ''],
            ['Exit Valuation to Return the Fund', this.returnTheFundValuationOutput ? this.returnTheFundValuationOutput.textContent : ''],
            ["Exit Valuation to Return 1/3 of Fund", this.returnOneThirdFundValuationOutput ? this.returnOneThirdFundValuationOutput.textContent : ""],
            ["Exit Valuation to Return 2/3 of Fund", this.returnTwoThirdsFundValuationOutput ? this.returnTwoThirdsFundValuationOutput.textContent : ""],        ];
        // Rounds table
        const roundsHeader = ['Round', 'Pre-Money Valuation', 'Round Size', 'Follow-on Investment', 'Ownership (%)', 'Pro Rata?'];
        const roundsRows = this.rounds.map(r => [
            r.type,
            r.preMoney,
            r.roundSize,
            r.followOn,
            r.ownership,
            r.proRata ? 'Yes' : 'No',
        ]);
        // Exit modeling
        let exitRows = [];
        if (this.exitSection && this.exitSection.style.display !== 'none') {
            exitRows = [
                ['Exit Valuation', this.exitValuationInput ? this.exitValuationInput.value : ''],
                ['Final Ownership (%)', this.exitFinalOwnershipInput ? this.exitFinalOwnershipInput.value : ''],
                ['Proceeds', this.exitProceedsInput ? this.exitProceedsInput.value : ''],
                ['Multiple', this.exitMultipleInput ? this.exitMultipleInput.value : ''],
            ];
        }
        // Build worksheet data
        let ws_data = [];
        ws_data.push(['Summary']);
        ws_data = ws_data.concat(summary);
        ws_data.push([]);
        ws_data.push(['Rounds']);
        ws_data.push(roundsHeader);
        ws_data = ws_data.concat(roundsRows);
        if (exitRows.length > 0) {
            ws_data.push([]);
            ws_data.push(['Exit Modeling']);
            ws_data = ws_data.concat(exitRows);
        }
        // Create worksheet and workbook
        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        const wb = XLSX.utils.book_new();
        // Excel sheet names: max 31 chars, no []:/?*\
        let safeSheetName = companyName.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 31) || 'Sheet1';
        XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
        // Download
        XLSX.writeFile(wb, `${companyName.replace(/[^a-zA-Z0-9]/g, '_') || 'VC_Model'}.xlsx`);
    }
}

// Initialize the calculator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new VCCalculator();
});

// Add keyboard shortcuts
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to focus on first input
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            document.getElementById('investment').focus();
        }
    });
}); 