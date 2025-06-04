// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

/**
 * @title Governance
 * @dev A basic DAO governance contract using OpenZeppelin Governor.
 * Allows NORU token holders (via a compatible IVotes token) to propose, vote on,
 * and execute proposals that can interact with other platform contracts.
 * A Timelock contract would typically be used as the executor for delayed, secure execution.
 */
contract Governance is Governor, GovernorSettings, GovernorCountingSimple, GovernorVotes, GovernorVotesQuorumFraction, GovernorTimelockControl {

    // IVotes _token: The NORU token contract, which must implement IVotes (e.g., ERC20Votes).
    // TimelockController _timelock: The Timelock contract that will execute proposals.

    /**
     * @param name The name of the governor.
     * @param token The IVotes token contract (e.g., NoruToken with ERC20Votes).
     * @param votingDelay How many blocks after a proposal is created should voting start.
     * @param votingPeriod How many blocks should the voting period last.
     * @param proposalThreshold Minimum voting power required to create a proposal.
     * @param timelock The TimelockController contract instance.
     * @param quorumPercentage The percentage of total supply needed for a vote to be valid (e.g., 4 for 4%).
     */
    constructor(
        string memory name,
        IVotes token,
        uint256 votingDelay,      // e.g., 1 block
        uint256 votingPeriod,     // e.g., 1 week in blocks (approx. 40320 blocks if 15s/block)
        uint256 proposalThreshold,// e.g., 1000e18 for 1000 tokens
        TimelockController timelock,
        uint256 quorumPercentage  // e.g., 4 for 4%
    )
        Governor(name)
        GovernorSettings(votingDelay, votingPeriod, proposalThreshold)
        GovernorVotes(token)
        GovernorVotesQuorumFraction(quorumPercentage)
        GovernorTimelockControl(timelock)
    {}

    // Override required functions from OpenZeppelin Governor
    function countingMode() public pure override returns (string memory) {
        return "support=bravo&quorum=for,abstain"; // For, Against, Abstain counting
    }

    // Additional configurations or custom logic can be added here.
    // For example, proposal types, specific execution logic, etc.
}

// Note: NoruToken would need to be an ERC20Votes compatible token for this Governor.
// A TimelockController contract would also need to be deployed and its address passed to this constructor.
// The Governor itself would be set as a proposer and executor on the Timelock.
