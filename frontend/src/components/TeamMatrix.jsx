import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useReadContract } from 'wagmi';

// Custom hook to fetch data per layer
function useFetchMatrixLayer(userId, layer, mynncryptConfig) {
  const { data: team, isLoading, error } = useReadContract({
    ...mynncryptConfig,
    functionName: 'getMatrixUsers',
    args: [userId, layer],
    enabled: !!userId && !!mynncryptConfig,
  });

  // Ensure return value is stable
  return useMemo(() => ({
    team: team || [],
    isLoading,
    error
  }), [team, isLoading, error]);
}

function TeamMatrix({ userId, mynncryptConfig }) {
  const [selectedLayer, setSelectedLayer] = useState(0);

  // Fetch data for each layer (0-23)
  const layer0 = useFetchMatrixLayer(userId, 0, mynncryptConfig);
  const layer1 = useFetchMatrixLayer(userId, 1, mynncryptConfig);
  const layer2 = useFetchMatrixLayer(userId, 2, mynncryptConfig);
  const layer3 = useFetchMatrixLayer(userId, 3, mynncryptConfig);
  const layer4 = useFetchMatrixLayer(userId, 4, mynncryptConfig);
  const layer5 = useFetchMatrixLayer(userId, 5, mynncryptConfig);
  const layer6 = useFetchMatrixLayer(userId, 6, mynncryptConfig);
  const layer7 = useFetchMatrixLayer(userId, 7, mynncryptConfig);
  const layer8 = useFetchMatrixLayer(userId, 8, mynncryptConfig);
  const layer9 = useFetchMatrixLayer(userId, 9, mynncryptConfig);
  const layer10 = useFetchMatrixLayer(userId, 10, mynncryptConfig);
  const layer11 = useFetchMatrixLayer(userId, 11, mynncryptConfig);
  const layer12 = useFetchMatrixLayer(userId, 12, mynncryptConfig);
  const layer13 = useFetchMatrixLayer(userId, 13, mynncryptConfig);
  const layer14 = useFetchMatrixLayer(userId, 14, mynncryptConfig);
  const layer15 = useFetchMatrixLayer(userId, 15, mynncryptConfig);
  const layer16 = useFetchMatrixLayer(userId, 16, mynncryptConfig);
  const layer17 = useFetchMatrixLayer(userId, 17, mynncryptConfig);
  const layer18 = useFetchMatrixLayer(userId, 18, mynncryptConfig);
  const layer19 = useFetchMatrixLayer(userId, 19, mynncryptConfig);
  const layer20 = useFetchMatrixLayer(userId, 20, mynncryptConfig);
  const layer21 = useFetchMatrixLayer(userId, 21, mynncryptConfig);
  const layer22 = useFetchMatrixLayer(userId, 22, mynncryptConfig);
  const layer23 = useFetchMatrixLayer(userId, 23, mynncryptConfig);

  // Memoize layersData untuk 24 layer
  const layersData = useMemo(() => [
    { layer: 0, ...layer0 },
    { layer: 1, ...layer1 },
    { layer: 2, ...layer2 },
    { layer: 3, ...layer3 },
    { layer: 4, ...layer4 },
    { layer: 5, ...layer5 },
    { layer: 6, ...layer6 },
    { layer: 7, ...layer7 },
    { layer: 8, ...layer8 },
    { layer: 9, ...layer9 },
    { layer: 10, ...layer10 },
    { layer: 11, ...layer11 },
    { layer: 12, ...layer12 },
    { layer: 13, ...layer13 },
    { layer: 14, ...layer14 },
    { layer: 15, ...layer15 },
    { layer: 16, ...layer16 },
    { layer: 17, ...layer17 },
    { layer: 18, ...layer18 },
    { layer: 19, ...layer19 },
    { layer: 20, ...layer20 },
    { layer: 21, ...layer21 },
    { layer: 22, ...layer22 },
    { layer: 23, ...layer23 },
  ], [
    layer0, layer1, layer2, layer3, layer4, layer5, layer6, layer7, layer8, layer9,
    layer10, layer11, layer12, layer13, layer14, layer15, layer16, layer17, layer18, layer19,
    layer20, layer21, layer22, layer23
  ]);

  // Memoize processed data
  const { matrixTeamByLayer, totalMatrixTeam } = useMemo(() => {
    const processedLayers = layersData.map(({ layer, team }) => ({
      layer,
      users: team
    }));
    
    const total = processedLayers.reduce((sum, { users }) => sum + users.length, 0);
    
    return {
      matrixTeamByLayer: processedLayers,
      totalMatrixTeam: total
    };
  }, [layersData]);

  // Memoize loading and error states
  const { isLoading, hasError } = useMemo(() => ({
    isLoading: layersData.some(data => data.isLoading),
    hasError: layersData.some(data => data.error)
  }), [layersData]);

  const getRankName = useCallback((level) => {
    const ranks = {
      1: 'Copper ',
      2: 'Silver ',
      3: 'Gold ',
      4: 'Platinum ',
      5: 'Titanium ',
      6: 'Amber ',
      7: 'Topaz ',
      8: 'Garnet ',
      9: 'Onyx ',
      10: 'Sapphire ',
      11: 'Ruby ',
      12: 'Diamond ',
    };
    return ranks[level] || 'N/A';
  }, []);

  const getLayerDescription = useCallback((layer) => {
    switch(layer) {
      case 0:
        return "Your Direct Team";
      case 1:
        return "Downline from Direct Team";
      case 2:
        return "Downline from Layer 1";
      case 3:
        return "Downline from Layer 2";
      case 4:
        return "Downline from Layer 3";
      default:
        return `Layer ${layer}`;
    }
  }, []);

  if (isLoading) {
    return (
      <div className="bg-[#1A3A6A] p-6 rounded-lg shadow-lg mt-6">
        <div className="flex items-center justify-center h-40">
          <p className="text-[#F5C45E] text-lg">Loading matrix team...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="bg-[#1A3A6A] p-6 rounded-lg shadow-lg mt-6">
        <div className="flex items-center justify-center h-40">
          <p className="text-[#BE3D2A] text-lg">Failed to fetch matrix team data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-[#1A3A6A] p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-[#F5C45E] mb-2">Total Matrix Team</h3>
          <p className="text-2xl font-bold text-white">{totalMatrixTeam}</p>
          <p className="text-sm text-gray-400 mt-2">All members in all layers</p>
        </div>

        <div className="bg-[#1A3A6A] p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-[#F5C45E] mb-2">{getLayerDescription(selectedLayer)}</h3>
          <p className="text-2xl font-bold text-white">
            {matrixTeamByLayer[selectedLayer]?.users.length || 0}
          </p>
          <p className="text-sm text-gray-400 mt-2">Total members in this layer</p>
        </div>
      </div>

      {/* Layer Selection */}
      <div className="bg-[#1A3A6A] p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-[#F5C45E] mb-4">Select Layer</h3>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 24 }, (_, layer) => (
            <button
              key={layer}
              onClick={() => setSelectedLayer(layer)}
              className={`px-4 py-2 rounded ${
                selectedLayer === layer
                  ? 'bg-[#BE3D2A] text-white'
                  : 'bg-[#102E50] text-[#F5C45E] hover:bg-[#BE3D2A] hover:text-white'
              }`}
            >
              {layer === 0 ? 'Direct Team' : `Layer ${layer}`}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-400 mt-2">{getLayerDescription(selectedLayer)}</p>
      </div>

      {/* Matrix Members */}
      <div className="bg-[#1A3A6A] p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-semibold text-[#F5C45E]">
            {getLayerDescription(selectedLayer)} ({matrixTeamByLayer[selectedLayer]?.users.length || 0} members)
          </h4>
        </div>
        
        {!matrixTeamByLayer[selectedLayer]?.users.length ? (
          <div className="text-center p-8">
            <p className="text-gray-400">
              {selectedLayer === 0 
                ? "You don't have a direct team yet" 
                : `No members in ${getLayerDescription(selectedLayer).toLowerCase()}`
              }
            </p>
            {selectedLayer === 0 && (
              <p className="text-sm text-yellow-400 mt-2">
                Invite your friends to join using your referral link
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {matrixTeamByLayer[selectedLayer].users.map((member, index) => (
              <div key={`${member.id}-${index}`} className="bg-[#102E50] p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-[#BE3D2A] flex items-center justify-center text-white font-bold">
                    {member.id?.slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-[#F5C45E]">{member.id}</p>
                    <p className="text-sm text-gray-400">{getRankName(Number(member.level))}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="text-sm grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400">Direct Team</p>
                      <p className="text-white">{member.directTeam}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Total Matrix</p>
                      <p className="text-white">{member.totalMatrixTeam}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TeamMatrix;