// contracts/DPPRegistry.sol
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./NoruToken.sol";

contract DPPRegistry is ERC721, Ownable {
    NoruToken public noruToken;
    uint256 private _currentTokenId = 0;
    
    struct DPPMetadata {
        string gtin;
        string category;
        string dataHash; // Hash of off-chain data
        address manufacturer;
        uint256 createdAt;
        bool isVerified;
    }
    
    mapping(uint256 => DPPMetadata) public dppMetadata;
    mapping(string => uint256) public gtinToTokenId;
    
    event DPPMinted(
        uint256 indexed tokenId,
        string gtin,
        address indexed manufacturer,
        string dataHash
    );
    
    event DPPVerified(uint256 indexed tokenId, address indexed verifier);
    
    constructor(address _noruToken) ERC721("Digital Product Passport", "DPP") {
        noruToken = NoruToken(_noruToken);
    }
    
    function mintDPP(
        string memory gtin,
        string memory category,
        string memory dataHash
    ) external returns (uint256) {
        require(bytes(gtin).length > 0, "GTIN required");
        require(gtinToTokenId[gtin] == 0, "DPP already exists for GTIN");
        
        // Burn NORU tokens for minting
        noruToken.burnForDPP(msg.sender, _currentTokenId + 1);
        
        _currentTokenId++;
        uint256 tokenId = _currentTokenId;
        
        _mint(msg.sender, tokenId);
        
        dppMetadata[tokenId] = DPPMetadata({
            gtin: gtin,
            category: category,
            dataHash: dataHash,
            manufacturer: msg.sender,
            createdAt: block.timestamp,
            isVerified: false
        });
        
        gtinToTokenId[gtin] = tokenId;
        
        emit DPPMinted(tokenId, gtin, msg.sender, dataHash);
        return tokenId;
    }
    
    function verifyDPP(uint256 tokenId) external {
        require(_exists(tokenId), "DPP does not exist");
        require(hasVerifierRole(msg.sender), "Not authorized to verify");
        
        dppMetadata[tokenId].isVerified = true;
        emit DPPVerified(tokenId, msg.sender);
    }
    
    function hasVerifierRole(address account) public view returns (bool) {
        // Integration with Firebase Auth custom claims
        // This would be checked via Oracle or off-chain verification
        return true; // Simplified for example
    }
}