import React from 'react';

function InfoPage({ onClose }) {
  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-zinc-800 mb-8">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-farm-pink via-farm-purple to-farm-cyan bg-clip-text text-transparent">
            How It Works
          </h1>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 space-y-12">
        
        {/* Introduction */}
        <section className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-farm-pink via-farm-purple to-farm-cyan rounded-2xl blur opacity-20 group-hover:opacity-30 transition"></div>
          <div className="relative bg-gradient-to-br from-zinc-900 to-black rounded-2xl p-8 border border-zinc-800/50">
            <h2 className="text-3xl font-bold text-white mb-4">Introduction</h2>
            <p className="text-gray-300 leading-relaxed text-lg">
              <span className="text-farm-pink font-bold">$HOOKED</span> is a new on-chain simulation game where players build their own COKE farm, grow and optimize production, fully on Cardano blockchain.
            </p>
            <p className="text-gray-300 leading-relaxed text-lg mt-4">
              Unlike memecoin games where you just buy the token, in <span className="text-farm-pink font-bold">$HOOKED</span> you <span className="text-farm-cyan font-semibold">earn the in-game currency $COKE by actually running your farm</span>. $COKE powers the entire economy—used to buy booster packs, unlock upgrades, and fuel the flywheel—while every in-game purchase is burned, keeping the system self-sustaining.
            </p>
          </div>
        </section>

        {/* COKE Token */}
        <section>
          <div className="bg-gradient-to-br from-zinc-900 to-black rounded-2xl p-8 border border-zinc-800/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-farm-pink to-farm-purple flex items-center justify-center text-2xl">
                💰
              </div>
              <h2 className="text-3xl font-bold text-white">$COKE Token</h2>
            </div>
            <p className="text-gray-300 leading-relaxed text-lg">
              The COKE Token ($COKE) functions as the utility currency within Farm Labs, primarily distributed to players who engage in farming and production.
            </p>

            {/* Utility Cards */}
            <div className="grid md:grid-cols-2 gap-4 mt-8">
              
              {/* Booster Packs */}
              <div className="bg-black/40 rounded-xl p-6 border border-zinc-800">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">📦</span>
                  <h3 className="text-xl font-bold text-farm-pink">Booster Packs</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Purchase Mystery Booster Packs with $COKE. These packs contain random power upgrades of varying rarities, each with distinct drop rates and unique grow power bonuses.
                </p>
              </div>

              {/* Farm Upgrades */}
              <div className="bg-black/40 rounded-xl p-6 border border-zinc-800">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">⚡</span>
                  <h3 className="text-xl font-bold text-farm-cyan">Farm Upgrades</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  $COKE can be spent to upgrade farms, unlocking new gameplay benefits such as increased farm capacity, access to rarer items, and enhanced economic efficiency.
                </p>
              </div>

              {/* Black Market */}
              <div className="bg-black/40 rounded-xl p-6 border border-zinc-800">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">🏪</span>
                  <h3 className="text-xl font-bold text-farm-purple">Black Market</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  A marketplace where $COKE is used to buy and sell in-game assets, power-ups, and other exclusive items between players.
                </p>
              </div>

              {/* Competitive Play */}
              <div className="bg-black/40 rounded-xl p-6 border border-zinc-800">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">⚔️</span>
                  <h3 className="text-xl font-bold text-yellow-400">Competitive Play</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  $COKE is the currency for competitions, allowing players to compete against others and compete for prizes in seasonal events.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Farming COKE */}
        <section>
          <div className="bg-gradient-to-br from-zinc-900 to-black rounded-2xl p-8 border border-zinc-800/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-2xl">
                🧪
              </div>
              <h2 className="text-3xl font-bold text-white">Farming $COKE</h2>
            </div>
            <p className="text-gray-300 leading-relaxed text-lg">
              <span className="text-farm-pink font-bold">$HOOKED</span> takes the legendary mechanics of Bitcoin mining and reimagines them as an on-chain COKE-farming system, built natively on Cardano.
            </p>
            <p className="text-gray-300 leading-relaxed text-lg mt-4">
              Players can grow virtual COKE farms, and each upgrade and booster contributes to their <span className="text-farm-pink font-semibold">Grow Power</span> — the on-chain equivalent of Bitcoin's hashpower.
            </p>

            {/* Farm Rewards */}
            <div className="mt-8 bg-black/60 rounded-xl p-6 border border-farm-cyan/30">
              <h3 className="text-xl font-bold text-farm-cyan mb-4">⚡ Farm Rewards</h3>
              <p className="text-gray-300 mb-4">
                Every second, $COKE emissions are distributed proportionally to each player's share of network Grow Power.
              </p>
              <p className="text-gray-400 text-sm mb-4">
                The formula mirrors Bitcoin's mining logic, but swaps hashpower for farms:
              </p>
              <div className="bg-black/80 rounded-lg p-4 font-mono text-sm text-farm-pink border border-zinc-800">
                reward = (user_grow_power / total_grow_power) × base_rate × elapsed_time
              </div>
              <ul className="mt-4 space-y-2 text-gray-400 text-sm">
                <li><span className="text-farm-pink font-mono">user_grow_power</span> → the total grow power of the player</li>
                <li><span className="text-farm-cyan font-mono">total_grow_power</span> → the combined grow power of all players</li>
                <li><span className="text-farm-purple font-mono">base_rate</span> → how much $COKE the system produces per second</li>
                <li><span className="text-yellow-400 font-mono">elapsed_time</span> → time since the player's last claim</li>
              </ul>
            </div>

            {/* Halving Schedule */}
            <div className="mt-6 bg-black/60 rounded-xl p-6 border border-orange-500/30">
              <h3 className="text-xl font-bold text-orange-400 mb-4">📉 Halving Schedule</h3>
              <p className="text-gray-300 mb-4">
                <span className="text-farm-pink font-bold">$HOOKED</span> follows a halving mechanism inspired by Bitcoin. The reward per second starts at <span className="text-orange-400 font-bold">0.5 $COKE</span> and halves every <span className="text-orange-400 font-bold">7 days</span> (604,800 seconds).
              </p>
              <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
                <p className="text-orange-200 text-sm font-medium">⚠️ This ensures long-term sustainability and rewards early adopters.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Important Notes */}
        <section>
          <div className="bg-gradient-to-br from-zinc-900 to-black rounded-2xl p-8 border border-zinc-800/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-2xl">
                ⚠️
              </div>
              <h2 className="text-3xl font-bold text-white">Important Notes</h2>
            </div>

            {/* Rewards May Decrease */}
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-yellow-400 mb-3">📊 Rewards May Decrease Over Time</h3>
              <div className="space-y-2 text-gray-300 text-sm">
                <p><span className="text-farm-pink font-mono">user_grow_power</span>: Fixed (determined by your upgrades and boosters)</p>
                <p><span className="text-farm-cyan font-mono">total_grow_power</span>: Increases as more players join and upgrade</p>
                <p className="text-yellow-300 font-medium">Result: The ratio user_grow_power / total_grow_power decreases over time.</p>
              </div>

              {/* Example */}
              <div className="mt-4 bg-black/60 rounded-lg p-4 border border-zinc-800">
                <h4 className="text-sm font-bold text-white mb-3">Example:</h4>
                <div className="space-y-3 text-xs font-mono">
                  <div>
                    <div className="text-gray-400 mb-1">Initial state:</div>
                    <div className="text-farm-pink">user_grow_power = 1,000</div>
                    <div className="text-farm-cyan">total_grow_power = 10,000</div>
                    <div className="text-green-400">user share = 10%</div>
                  </div>
                  <div className="h-px bg-zinc-800"></div>
                  <div>
                    <div className="text-gray-400 mb-1">After 1 hour (as new players join):</div>
                    <div className="text-farm-pink">user_grow_power = 1,000 (unchanged)</div>
                    <div className="text-farm-cyan">total_grow_power = 50,000 (increased)</div>
                    <div className="text-orange-400">user share = 2% (reduced to one-fifth)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estimated vs Actual */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                <h4 className="text-sm font-bold text-blue-400 mb-2">💭 Estimated Value (Frontend)</h4>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Calculated based on current share ratio</li>
                  <li>• Does not account for future changes</li>
                  <li>• Shows potential earnings</li>
                </ul>
              </div>
              <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
                <h4 className="text-sm font-bold text-green-400 mb-2">✅ Actual Rewards (Claim)</h4>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Calculated at time of claim</li>
                  <li>• Reflects actual network state</li>
                  <li>• Real earned amount</li>
                </ul>
              </div>
            </div>

            {/* Importance of Regular Claims */}
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-red-400 mb-3">⏰ Importance of Regular Claims</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-400">→</span>
                  <span>Leaving rewards unclaimed for a long time = higher risk of dilution</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">→</span>
                  <span>Claiming frequently = locks in rewards at your current share ratio</span>
                </li>
              </ul>
              <div className="mt-4 bg-black/60 rounded-lg p-3 border border-zinc-800">
                <p className="text-xs text-gray-400">
                  If your network share is too small (below 0.0001%), your rewards may round down to 0 since your share is effectively negligible.
                </p>
                <p className="text-xs text-farm-pink font-medium mt-2">
                  ➡️ In that case, buy more booster packs to increase your grow power!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mystery Booster Pack */}
        <section>
          <div className="bg-gradient-to-br from-zinc-900 to-black rounded-2xl p-8 border border-zinc-800/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                📦
              </div>
              <h2 className="text-3xl font-bold text-white">Mystery Booster Pack</h2>
            </div>
            <p className="text-gray-300 leading-relaxed text-lg mb-6">
              Mystery Booster Packs are the heartbeat of the hustle in <span className="text-farm-pink font-bold">$HOOKED</span>. Each pack costs <span className="text-farm-pink font-bold">300 $COKE</span> and comes loaded with 1 random power upgrade, ranging anywhere from Common → Legendary.
            </p>

            {/* Pack Tiers */}
            <div className="grid md:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-4 text-center border border-gray-600">
                <div className="text-2xl mb-2">⚪</div>
                <div className="text-sm font-bold text-gray-300">Common</div>
                <div className="text-xs text-gray-500 mt-1">+10-19 Power</div>
              </div>
              <div className="bg-gradient-to-br from-blue-700 to-blue-800 rounded-lg p-4 text-center border border-blue-600">
                <div className="text-2xl mb-2">🔵</div>
                <div className="text-sm font-bold text-blue-300">Rare</div>
                <div className="text-xs text-blue-400 mt-1">+20-29 Power</div>
              </div>
              <div className="bg-gradient-to-br from-purple-700 to-purple-800 rounded-lg p-4 text-center border border-purple-600">
                <div className="text-2xl mb-2">🟣</div>
                <div className="text-sm font-bold text-purple-300">Epic</div>
                <div className="text-xs text-purple-400 mt-1">+30-39 Power</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-lg p-4 text-center border border-yellow-500">
                <div className="text-2xl mb-2">🟡</div>
                <div className="text-sm font-bold text-yellow-300">Legendary</div>
                <div className="text-xs text-yellow-400 mt-1">+40-50 Power</div>
              </div>
            </div>

            <div className="mt-6 bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
              <p className="text-purple-200 text-sm">
                💎 The higher your farm level, the better your odds of pulling top-tier upgrades!
              </p>
            </div>
          </div>
        </section>

        {/* Farm Upgrades */}
        <section>
          <div className="bg-gradient-to-br from-zinc-900 to-black rounded-2xl p-8 border border-zinc-800/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-2xl">
                ⚡
              </div>
              <h2 className="text-3xl font-bold text-white">Farm Upgrades</h2>
            </div>
            <p className="text-gray-300 leading-relaxed text-lg mb-6">
              Farms can be upgraded using $COKE to unlock powerful benefits and increase your earning potential.
            </p>

            {/* Upgrade Benefits */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-black/40 rounded-xl p-5 border border-zinc-800 text-center">
                <div className="text-3xl mb-3">📈</div>
                <h4 className="text-sm font-bold text-white mb-2">Increased Capacity</h4>
                <p className="text-xs text-gray-400">Boost your farm's production potential</p>
              </div>
              <div className="bg-black/40 rounded-xl p-5 border border-zinc-800 text-center">
                <div className="text-3xl mb-3">🎯</div>
                <h4 className="text-sm font-bold text-white mb-2">Rarer Items</h4>
                <p className="text-xs text-gray-400">Unlock access to premium content</p>
              </div>
              <div className="bg-black/40 rounded-xl p-5 border border-zinc-800 text-center">
                <div className="text-3xl mb-3">💹</div>
                <h4 className="text-sm font-bold text-white mb-2">Economic Efficiency</h4>
                <p className="text-xs text-gray-400">Maximize your COKE earnings</p>
              </div>
            </div>

            <div className="mt-6 bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
              <p className="text-cyan-200 text-sm">
                🚀 <span className="font-bold">Coming Soon:</span> Each upgrade will have a 24-hour cooldown to maintain game balance.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default InfoPage;

