// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title DigitalProductPassport
 * @dev ERC721 Non-Fungible Token for Digital Product Passports.
 * Each token represents a unique DPP.
 */
contract DigitalProductPassport is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    struct ProductInfo {
        string gtin; // Global Trade Item Number
        string name; // Product Name
        address manufacturer; // Manufacturer's wallet address
        uint256 sustainabilityScore; // Example: Score out of 100
        string ebsiCredentialId; // Link to EBSI Verifiable Credential
        bool isVerified;
        uint256 createdAt;
    }

    mapping(uint256 => ProductInfo) public products;
    mapping(string => uint256) public gtinToTokenId; // GTIN to Token ID mapping

    address public verifierAddress;

    event ProductMinted(uint256 indexed tokenId, string gtin, address indexed manufacturer, string name);
    event ProductVerified(uint256 indexed tokenId, string ebsiCredentialId, address indexed verifier);
    event VerifierSet(address indexed newVerifierAddress);

    constructor(address initialOwner) ERC721("Digital Product Passport", "DPP") Ownable(initialOwner) {
        verifierAddress = initialOwner; // Initially, owner can verify
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://api.norruva.com/v1/metadata/dpp/"; // Example base URI
    }

    function setVerifier(address _verifierAddress) public onlyOwner {
        require(_verifierAddress != address(0), "DPP: Verifier address cannot be zero");
        verifierAddress = _verifierAddress;
        emit VerifierSet(_verifierAddress);
    }

    function mintDPP(
        address _to,
        string memory _gtin,
        string memory _name,
        uint256 _sustainabilityScore,
        string memory _tokenURI
    ) public onlyOwner returns (uint256) {
        require(bytes(_gtin).length > 0, "DPP: GTIN cannot be empty");
        require(gtinToTokenId[_gtin] == 0, "DPP: GTIN already associated with a token");

        _tokenIdCounter.increment();
        uint256 newTokenId = _tokenIdCounter.current();

        _safeMint(_to, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);

        products[newTokenId] = ProductInfo({
            gtin: _gtin,
            name: _name,
            manufacturer: _to, // Assuming the recipient is the manufacturer
            sustainabilityScore: _sustainabilityScore,
            ebsiCredentialId: "", // Initially empty
            isVerified: false,
            createdAt: block.timestamp
        });
        
        gtinToTokenId[_gtin] = newTokenId;

        emit ProductMinted(newTokenId, _gtin, _to, _name);
        return newTokenId;
    }

    function verifyProduct(uint256 _tokenId, string memory _ebsiCredentialId) public {
        require(msg.sender == verifierAddress || msg.sender == owner(), "DPP: Caller is not an authorized verifier or owner");
        require(_exists(_tokenId), "DPP: Token does not exist");
        require(bytes(_ebsiCredentialId).length > 0, "DPP: EBSI Credential ID cannot be empty");

        ProductInfo storage product = products[_tokenId];
        product.ebsiCredentialId = _ebsiCredentialId;
        product.isVerified = true;

        emit ProductVerified(_tokenId, _ebsiCredentialId, msg.sender);
    }
    
    function updateTokenURI(uint256 tokenId, string memory _tokenURI) public {
        require(_exists(tokenId), "ERC721Metadata: URI set for nonexistent token");
        require(ownerOf(tokenId) == msg.sender || getApproved(tokenId) == msg.sender || isApprovedForAll(ownerOf(tokenId), msg.sender), "DPP: Caller is not owner nor approved");
        _setTokenURI(tokenId, _tokenURI);
    }

    // The following functions are overrides required by Solidity.
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Burn function - only owner of token can burn
    function burn(uint256 tokenId) public virtual override {
        //solhint-disable-next-line max-line-length
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721Burnable: caller is not owner nor approved");
        ProductInfo storage product = products[tokenId];
        require(bytes(product.gtin).length > 0, "DPP: Product info not found for burn");
        delete gtinToTokenId[product.gtin]; // Clean up GTIN mapping
        delete products[tokenId]; // Clean up product info storage
        _burn(tokenId);
    }
}
