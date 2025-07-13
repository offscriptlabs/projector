# 🧮 VC Calculator

A modern web-based calculator for venture capitalists to estimate ownership, dilution, and exit valuations needed to return their fund.

## 🎯 Purpose

This calculator helps VCs understand:
- **Current ownership** in a company after investment
- **Final ownership** after expected future dilution
- **Exit valuation** required to return the entire fund
- **ROI multiple** as a bonus metric

## 📊 Inputs

1. **Investment Amount** - How much you're investing (USD)
2. **Pre-Money Valuation** - Company valuation before the round (USD)
3. **Round Size** - Total size of the funding round (USD)
4. **Fund Size** - Total size of your fund (USD)
5. **Expected Future Dilution** - Percentage of ownership you expect to lose in future rounds (%)

## 📈 Outputs

1. **Current Ownership (%)** - Your ownership immediately after investment
2. **Final Ownership After Dilution (%)** - Your ownership after expected dilution
3. **Exit Valuation to Return the Fund ($)** - The company valuation needed at exit to return your entire fund
4. **ROI Multiple** - How many times your investment needs to multiply to return the fund

## 🧮 Calculation Logic

```
postMoney = preMoney + roundSize
ownership = investment / postMoney
dilutedOwnership = ownership * (1 - dilution)
returnTheFundValuation = fundSize / dilutedOwnership
roiMultiple = returnTheFundValuation / investment
```

## 🚀 Features

- **Real-time calculations** - Results update as you type
- **Modern UI** - Clean, professional design with smooth animations
- **Responsive design** - Works on desktop and mobile
- **USD formatting** - Large numbers displayed as $1.2M, $500K, etc.
- **Input validation** - Visual feedback for valid/invalid inputs
- **Keyboard shortcuts** - Ctrl/Cmd + Enter to focus first input

## 🎨 Design

- **Gradient backgrounds** for visual appeal
- **Card-based layout** for clear information hierarchy
- **Hover effects** and smooth transitions
- **Color-coded results** - Highlighted cards for key metrics
- **Mobile-responsive** grid layout

## 🛠️ Technical Stack

- **HTML5** - Semantic structure
- **CSS3** - Modern styling with Flexbox and Grid
- **Vanilla JavaScript** - No dependencies, fast and lightweight
- **Google Fonts** - Inter font family for professional typography

## 📱 Usage

1. Open `index.html` in any modern web browser
2. Enter your investment parameters
3. Watch results update in real-time
4. Adjust the dilution slider to see different scenarios

## 🎯 Example Scenario

**Inputs:**
- Investment: $1M
- Pre-Money: $10M
- Round Size: $5M
- Fund Size: $100M
- Dilution: 25%

**Results:**
- Current Ownership: 6.67%
- Final Ownership: 5.00%
- Exit Valuation Needed: $2.0B
- ROI Multiple: 2,000x

## 🔧 Customization

The calculator is built with vanilla web technologies, making it easy to:
- Modify the calculation logic in `script.js`
- Update the styling in `styles.css`
- Add new input fields or output metrics
- Deploy to any web server

## 📄 License

This project is open source and available under the MIT License.

---

*Built for venture capitalists to make informed investment decisions and understand exit scenarios.* 