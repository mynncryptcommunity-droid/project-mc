import React, { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';

function TeamTree({ userId, mynncryptConfig }) {
  const [treeData, setTreeData] = useState(null);
  const [selectedId, setSelectedId] = useState(userId);
  const [expandedLevels, setExpandedLevels] = useState([0]);
  const [loading, setLoading] = useState(true);

  // Fetch root user info
  const { data: rootUserInfo } = useReadContract({
    ...mynncryptConfig,
    functionName: 'userInfo',
    args: [selectedId],
    enabled: !!selectedId,
  });

  // Fetch direct team users using the correct function name
  const { data: directTeamUsersData } = useReadContract({
    ...mynncryptConfig,
    functionName: 'getDirectTeamUsers',
    args: [selectedId],
    enabled: !!selectedId,
  });

  // Fetch matrix users for each direct team member (for deeper trees)
  const { data: matrixUsers } = useReadContract({
    ...mynncryptConfig,
    functionName: 'getMatrixUsers',
    args: [selectedId, BigInt(1)],
    enabled: !!selectedId,
  });

  useEffect(() => {
    if (!rootUserInfo) return;
    
    setLoading(true);
    
    console.log('TeamTree Debug:', {
      selectedId,
      rootUserInfo: rootUserInfo ? {
        level: rootUserInfo.level || rootUserInfo[7],
        id: rootUserInfo.id || rootUserInfo[12],
        directTeam: rootUserInfo.directTeam || rootUserInfo[8]
      } : null,
      directTeamUsersData: directTeamUsersData?.length || 0,
      matrixUsers: matrixUsers?.length || 0
    });
    
    // Build children array - prioritize direct team users
    let children = [];
    
    if (directTeamUsersData && Array.isArray(directTeamUsersData) && directTeamUsersData.length > 0) {
      // directTeamUsersData returns full User objects with named properties (not array indices)
      children = directTeamUsersData.map((user, idx) => {
        // Extract using named properties from decoded tuple
        const memberId = user.id?.toString() || '';
        const memberLevel = user.level ? Number(user.level) : 0;
        console.log(`Direct team member ${idx}:`, { memberId, memberLevel, user });
        return {
          id: memberId,
          level: memberLevel,
          isDirectTeam: true
        };
      });
      console.log('Using directTeamUsers, found', children.length, 'direct members:', children);
    } else if (matrixUsers && Array.isArray(matrixUsers) && matrixUsers.length > 0) {
      // Fallback to matrix users if no direct team
      children = matrixUsers.map((user, idx) => {
        const memberId = user.id?.toString() || '';
        const memberLevel = user.level ? Number(user.level) : 0;
        console.log(`Matrix member ${idx}:`, { memberId, memberLevel, user });
        return {
          id: memberId,
          level: memberLevel,
          isDirectTeam: false
        };
      });
      console.log('Using matrixUsers fallback, found', children.length, 'matrix members:', children);
    }

    const rootLevel = rootUserInfo.level ? Number(rootUserInfo.level) : Number(rootUserInfo[7]) || 1;
    
    setTreeData({
      id: selectedId,
      level: rootLevel,
      children: children
    });
    
    // Auto-expand level 0 and 1 to show direct team members by default
    setExpandedLevels([0, 1]);
    setLoading(false);
  }, [selectedId, rootUserInfo, directTeamUsersData, matrixUsers]);

  // Generate avatar color based on ID
  const getAvatarColor = (id) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#52C4A1'
    ];
    if (!id || id.length === 0) return colors[0];
    const hash = (id.charCodeAt(0) || 0) + (id.charCodeAt(id.length - 1) || 0);
    return colors[hash % colors.length];
  };

  // Get avatar initials
  const getAvatarInitials = (id) => {
    if (!id || id.length === 0) return 'NA';
    return id.substring(0, 2).toUpperCase();
  };

  // Avatar component
  const UserAvatar = ({ id, size = 'md' }) => {
    const bgColor = getAvatarColor(id);
    const initials = getAvatarInitials(id);
    const sizeClass = {
      sm: 'w-10 h-10 text-xs',
      md: 'w-16 h-16 text-lg',
      lg: 'w-20 h-20 text-2xl'
    }[size];

    return (
      <div
        className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white shadow-lg border-2 border-[#F5C45E]`}
        style={{ backgroundColor: bgColor }}
      >
        {initials}
      </div>
    );
  };

  // Node component
  const TreeNode = ({ node, isRoot = false, depth = 0 }) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedLevels.includes(depth);

    const toggleExpand = () => {
      if (isExpanded) {
        setExpandedLevels(expandedLevels.filter(l => l !== depth));
      } else {
        setExpandedLevels([...expandedLevels, depth]);
      }
    };

    return (
      <div className="flex flex-col items-center">
        {/* Node */}
        <div className={`relative flex flex-col items-center ${isRoot ? 'mb-8' : 'mb-4'}`}>
          {/* Avatar */}
          <div
            className={`transition-transform duration-300 hover:scale-110 cursor-pointer ${node.isDirectTeam ? 'ring-2 ring-green-500' : ''}`}
            onClick={() => !isRoot && setSelectedId(node.id)}
            title={`Click to view ${node.id}'s tree`}
          >
            <UserAvatar id={node.id} size={isRoot ? 'lg' : 'md'} />
          </div>

          {/* User Info Card */}
          <div className={`mt-3 text-center rounded-lg p-4 border backdrop-blur-sm transition-all duration-300 ${node.isDirectTeam ? 'bg-gradient-to-br from-green-900/40 to-green-800/30 border-green-400/70 shadow-lg shadow-green-500/20 ring-1 ring-green-500/50' : 'bg-[#1A3A6A]/60 border-[#4DA8DA]/40 hover:bg-[#1A3A6A]/80'}`}>
            <p className="font-bold text-[#F5C45E] text-sm md:text-base">{node.id}</p>
            <p className="text-xs text-gray-300">Level {node.level}</p>
            {node.isDirectTeam && (
              <p className="text-xs text-green-300 font-semibold mt-2 bg-green-900/50 px-2 py-1 rounded inline-block">✓ Direct Team</p>
            )}
            {!isRoot && (
              <button
                onClick={() => setSelectedId(node.id)}
                className="mt-3 px-3 py-1 text-xs bg-[#4DA8DA] hover:bg-[#3b8bb3] text-white rounded transition-colors w-full"
              >
                View Tree
              </button>
            )}
          </div>

          {/* Expand/Collapse Button */}
          {hasChildren && !isRoot && (
            <button
              onClick={toggleExpand}
              className="mt-2 px-2 py-1 text-xs bg-[#F5C45E]/20 hover:bg-[#F5C45E]/40 text-[#F5C45E] rounded transition-colors"
            >
              {isExpanded ? '▼' : '▶'} {node.children.length} members
            </button>
          )}
        </div>

        {/* Connector Line */}
        {hasChildren && isExpanded && (
          <div className="relative mt-6">
            {/* Vertical line down from root node */}
            <div className="w-1 h-8 bg-gradient-to-b from-[#F5C45E] to-[#4DA8DA] mx-auto"></div>

            {/* Horizontal line connecting all children */}
            <div className="flex justify-center items-start relative">
              {node.children.length > 1 && (
                <div
                  className="absolute h-1 bg-gradient-to-r from-[#4DA8DA] via-[#F5C45E] to-[#4DA8DA]"
                  style={{
                    top: '-8px',
                    left: '50%',
                    right: 'auto',
                    transform: 'translateX(-50%)',
                    width: `calc(${node.children.length * 250}px)`
                  }}
                ></div>
              )}

              {/* Children Nodes */}
              <div className="flex gap-16 flex-wrap justify-center">
                {node.children.map((child, idx) => (
                  <div key={child.id} className="relative">
                    {/* Vertical connector from horizontal line to child */}
                    <div className="absolute w-1 h-8 bg-gradient-to-b from-[#4DA8DA] to-[#F5C45E] left-1/2 -top-8 transform -translate-x-1/2"></div>

                    {/* Child Node */}
                    <TreeNode node={child} isRoot={false} depth={depth + 1} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-[#F5C45E] border-t-[#4DA8DA] rounded-full animate-spin"></div>
          </div>
          <p className="text-[#F5C45E] mt-4">Loading team structure...</p>
        </div>
      </div>
    );
  }

  if (!treeData) {
    return (
      <div className="flex items-center justify-center h-[600px] text-gray-400">
        <p>No team data available</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-b from-[#0A1929] to-[#102E50] rounded-lg p-8 border border-[#1e3a5f]">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="text-[#4DA8DA] font-medium text-lg">
            {selectedId === userId ? 'Your Organization Structure' : `Team Structure: ${selectedId}`}
          </p>
          <p className="text-gray-400 text-sm mt-1">Click avatars to navigate team members</p>
        </div>
        {selectedId !== userId && (
          <button
            onClick={() => {
              setSelectedId(userId);
              setExpandedLevels([0]);
            }}
            className="px-4 py-2 bg-[#4DA8DA] hover:bg-[#3b8bb3] text-white rounded-lg transition-colors"
          >
            ← Back to Root
          </button>
        )}
      </div>

      {/* Tree Container */}
      <div className="overflow-x-auto">
        <div className="flex justify-center py-8 min-w-max">
          {treeData && <TreeNode node={treeData} isRoot={true} depth={0} />}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 pt-4 border-t border-[#4DA8DA]/30 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#F5C45E] rounded-full"></div>
          <span>User ID</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-green-500 bg-green-900/30 rounded-full"></div>
          <span>Direct Team</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-[#F5C45E] rounded-full"></div>
          <span>Click Avatar to View</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-1 bg-gradient-to-r from-[#4DA8DA] to-[#F5C45E]"></div>
          <span>Connectors</span>
        </div>
      </div>
    </div>
  );
}

export default TeamTree; 