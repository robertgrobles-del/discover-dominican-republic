import { motion } from "framer-motion";
import { Wallet, RefreshCw, Layers, Gem, Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Collectible, UserCollectible, NftTransaction, rarityConfig } from "@/data/souvenirsData";

interface SouvenirsWeb3WalletTabProps {
  isConnected: boolean;
  isConnecting: boolean;
  walletAddress: string;
  simulatedBalance: number;
  txHistory: NftTransaction[];
  userCollectibles: UserCollectible[];
  collectibles: Collectible[];
  mintedNfts: string[];
  isMining: boolean;
  isTransferring: boolean;
  connectWallet: () => void;
  disconnectWallet: () => void;
  startMinting: (item: Collectible) => void;
  setActiveItemForTransfer: (item: Collectible) => void;
}

export function SouvenirsWeb3WalletTab({
  isConnected,
  isConnecting,
  walletAddress,
  simulatedBalance,
  txHistory,
  userCollectibles,
  collectibles,
  mintedNfts,
  isMining,
  isTransferring,
  connectWallet,
  disconnectWallet,
  startMinting,
  setActiveItemForTransfer
}: SouvenirsWeb3WalletTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Billetera Info y Conexión */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="border-border bg-card/70 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Wallet className="h-5 w-5 text-primary" />
              Billetera Web3
            </CardTitle>
            <CardDescription>
              Vincula tu wallet descentralizada para mintear y transferir souvenirs en blockchain.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isConnected ? (
              <Button 
                className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold"
                onClick={connectWallet}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4" />
                    Conectar Billetera Web3
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-secondary/30 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground font-semibold">Dirección de Wallet</p>
                  <p className="text-sm font-mono text-foreground select-all break-all">{walletAddress}</p>
                </div>

                <div className="flex justify-between items-center px-1">
                  <div>
                    <p className="text-xs text-muted-foreground">Balance Estimado</p>
                    <p className="text-lg font-bold text-foreground">{simulatedBalance.toFixed(4)} ETH</p>
                  </div>
                  <Badge className="bg-primary/20 text-primary border border-primary/30">
                    Ethereum Mainnet
                  </Badge>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full text-xs text-destructive hover:bg-destructive/15 border-destructive/25"
                  onClick={disconnectWallet}
                >
                  Desconectar Wallet
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Historial de Transacciones */}
        <Card className="border-border bg-card/70 backdrop-blur-md">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Historial Blockchain
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {txHistory.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No hay transacciones registradas.</p>
            ) : (
              <ScrollArea className="h-[220px] pr-2">
                <div className="space-y-3">
                  {txHistory.map(tx => (
                    <div key={tx.id} className="p-2.5 rounded bg-secondary/25 border border-border/40 text-[11px] space-y-1">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-foreground">{tx.action}</span>
                        <span className="text-muted-foreground text-[9px]">{tx.timestamp}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Activo: {tx.assetName}</span>
                        <span className="truncate max-w-[80px] font-mono">{tx.recipient}</span>
                      </div>
                      <div className="text-[10px] text-primary hover:underline font-mono truncate cursor-pointer" onClick={() => toast.info(`Tx Hash: ${tx.hash}`)}>
                        Tx: {tx.hash}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Inventario de NFTs y Acciones */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-border bg-card/65">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Mis Coleccionables Acumulados</CardTitle>
            <CardDescription>
              Solamente tus logros desbloqueados pueden ser minteados y exportados a la blockchain.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userCollectibles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Gem className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tienes coleccionables desbloqueados todavía.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userCollectibles.map(uc => {
                  const item = collectibles.find(c => c.id === uc.collectible_id);
                  if (!item) return null;
                  const isMinted = mintedNfts.includes(item.id);
                  
                  return (
                    <div key={uc.id} className="p-4 rounded-xl border border-border/60 bg-surface flex gap-3 items-center justify-between group hover:border-primary/30 transition-all">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {item.thumbnail_url || item.image_url ? (
                            <img src={item.thumbnail_url || item.image_url || ""} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10">
                              <Gem className="h-5 w-5 text-primary" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-foreground truncate">{item.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{rarityConfig[item.rarity]?.label}</p>
                          {isMinted ? (
                            <span className="text-[10px] text-green-500 font-semibold flex items-center gap-0.5 mt-0.5">
                              ✓ Minted (NFT)
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-500 font-semibold flex items-center gap-0.5 mt-0.5">
                              Pendiente de Mint
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-1.5 flex-shrink-0">
                        {!isMinted ? (
                          <Button 
                            size="sm" 
                            className="h-8 text-xs gap-1.5"
                            onClick={() => startMinting(item)}
                            disabled={!isConnected || isMining}
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            Mint NFT
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs gap-1.5 border-primary text-primary hover:bg-primary/10"
                            onClick={() => setActiveItemForTransfer(item)}
                            disabled={isTransferring}
                          >
                            <Send className="h-3.5 w-3.5" />
                            Transferir
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
