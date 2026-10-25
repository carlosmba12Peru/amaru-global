// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

/**
 * @title ClimateAuditAnchor
 * @author AMARU-CLIMATE Sovereign Team
 * @notice Notaría digital matemática para la certificación inmutable de eventos hidrometeorológicos,
 *         planes de contingencia EDAN y asignación de fondos humanitarios (PP 0068).
 * @dev Diseñado para el IEEE ClimateChain Global Hackathon 2026 (Track 4: Climate Data & Environmental Monitoring).
 *      Optimizado para redes EVM L2/L3 (Polygon Amoy / Arbitrum / Sepolia).
 */
contract ClimateAuditAnchor {
    
    struct AnchorEntry {
        uint256 anchorId;
        bytes32 merkleRoot;
        uint256 localBlockHeight;
        uint256 eventsCount;
        uint256 blockTimestamp;
        string dataSummary;
        address notaryOperator;
    }

    // Dirección del operador soberano (FastAPI Backend Key)
    address public sovereignOperator;
    
    // Lista histórica de anclajes inmutables
    AnchorEntry[] private _anchors;
    
    // Mapeo de MerkleRoot -> booleano para verificación instantánea O(1)
    mapping(bytes32 => bool) public isMerkleRootAnchored;
    mapping(bytes32 => uint256) public rootToAnchorId;

    // Eventos emitidos para indexadores (The Graph / RPC Webhooks)
    event ClimateStateAnchored(
        uint256 indexed anchorId,
        bytes32 indexed merkleRoot,
        uint256 localBlockHeight,
        uint256 eventsCount,
        uint256 timestamp,
        string dataSummary,
        address indexed operator
    );

    event OperatorTransferred(address indexed previousOperator, address indexed newOperator);

    modifier onlyOperator() {
        require(msg.sender == sovereignOperator, "AMARU-CLIMATE: Caller is not the sovereign operator");
        _;
    }

    constructor() {
        sovereignOperator = msg.sender;
        emit OperatorTransferred(address(0), msg.sender);
    }

    /**
     * @notice Sella una raíz de Merkle de la bitácora WORM de AMARU en la blockchain.
     * @param _merkleRoot Raíz Keccak-256/SHA-256 del lote de eventos.
     * @param _localBlockHeight Altura del bloque en el libro mayor local.
     * @param _eventsCount Cantidad de eventos auditados en este lote.
     * @param _dataSummary Resumen canónico de los eventos (ej: 'FEN-PIURA-BATCH-042').
     */
    function anchorState(
        bytes32 _merkleRoot,
        uint256 _localBlockHeight,
        uint256 _eventsCount,
        string calldata _dataSummary
    ) external onlyOperator returns (uint256) {
        require(_merkleRoot != bytes32(0), "AMARU-CLIMATE: Merkle root cannot be empty");
        require(!isMerkleRootAnchored[_merkleRoot], "AMARU-CLIMATE: State already anchored");

        uint256 newId = _anchors.length;
        
        AnchorEntry memory entry = AnchorEntry({
            anchorId: newId,
            merkleRoot: _merkleRoot,
            localBlockHeight: _localBlockHeight,
            eventsCount: _eventsCount,
            blockTimestamp: block.timestamp,
            dataSummary: _dataSummary,
            notaryOperator: msg.sender
        });

        _anchors.push(entry);
        isMerkleRootAnchored[_merkleRoot] = true;
        rootToAnchorId[_merkleRoot] = newId;

        emit ClimateStateAnchored(
            newId,
            _merkleRoot,
            _localBlockHeight,
            _eventsCount,
            block.timestamp,
            _dataSummary,
            msg.sender
        );

        return newId;
    }

    /**
     * @notice Retorna la cantidad total de anclajes emitidos.
     */
    function totalAnchors() external view returns (uint256) {
        return _anchors.length;
    }

    /**
     * @notice Obtiene los datos detallados de un anclaje por su ID.
     */
    function getAnchor(uint256 _anchorId) external view returns (AnchorEntry memory) {
        require(_anchorId < _anchors.length, "AMARU-CLIMATE: Anchor ID does not exist");
        return _anchors[_anchorId];
    }

    /**
     * @notice Retorna el último anclaje emitido.
     */
    function getLatestAnchor() external view returns (AnchorEntry memory) {
        require(_anchors.length > 0, "AMARU-CLIMATE: No anchors registered yet");
        return _anchors[_anchors.length - 1];
    }

    /**
     * @notice Permite transferir el rol de operador en caso de rotación de claves C2.
     */
    function transferOperator(address _newOperator) external onlyOperator {
        require(_newOperator != address(0), "AMARU-CLIMATE: Invalid new operator address");
        emit OperatorTransferred(sovereignOperator, _newOperator);
        sovereignOperator = _newOperator;
    }
}
