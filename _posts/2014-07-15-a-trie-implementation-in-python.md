---
layout: post
tags: python trie
---
```python
class Trie:
    def __init__(self):
        self.rootNode = TrieNode("")
        self.size = 0
        #self.
        
    def insert(self, word):
        node = self.rootNode
        key = ""
        for letter in word:
            key += letter
            if letter in node.subNodes:
                node = node[letter]
            else:
                node[letter] = TrieNode(key) 
                node = node[letter]
                  
        node.isKey = True        
        self.size += 1
    
    def __repr__(self):
        return "Trie<size={}>\n{}".format(self.size, self.rootNode.__str__(0)) 
    
        
class TrieNode:
    def __init__(self, content, isKey=False):
        self.isKey = isKey
        self.content = content
        self.subNodes = {}
    
    def __getitem__(self, letter):
        return self.subNodes[letter]
    
    def __setitem__(self, letter, node):
        self.subNodes[letter] = node
    
    def __contains__(self, item):
        return item in self.subNodes
    
    def __repr__(self):
        return 'TrieNode<\'{}\', {}>'.format(self.content, self.subNodes.keys())
    
    def __str__(self, level=0):
        ret = ''
        indent = ' ' * level
        if self.isKey:
            ret += '{}  {}  {}'.format(indent, self.content, '\n')
        else:
            ret += '{} ({}) {}'.format(indent, self.content, '\n')

        for key, value in self.subNodes.iteritems():
            ret += '{}-{}:{}'.format(indent + ' ', key , value.__str__(level + 1))
        return ret   
```